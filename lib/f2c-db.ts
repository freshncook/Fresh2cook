import { prisma } from "@/lib/prisma";

/*
 * Fresh2Cook extra tables (AppSetting, CustomerAccount) on SQLite.
 *
 * These are created automatically on first use with plain SQL, so they work
 * even when `prisma generate` could not run (e.g. server was running on Windows).
 * The table layout is exactly what Prisma itself would create for the
 * AppSetting / CustomerAccount models in prisma/schema.prisma, so a later
 * `prisma db push` sees no difference.
 * Dates are stored the Prisma way: milliseconds since 1970.
 */

const DDL = [
  `CREATE TABLE IF NOT EXISTS "AppSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "CustomerAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CustomerAccount_mobile_key" ON "CustomerAccount"("mobile")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CustomerAccount_referralCode_key" ON "CustomerAccount"("referralCode")`,
];

let ready: Promise<void> | null = null;

export function ensureF2CTables() {
  if (!ready) {
    ready = (async () => {
      for (const sql of DDL) await prisma.$executeRawUnsafe(sql);
    })().catch((error) => {
      ready = null; // try again next time
      throw error;
    });
  }
  return ready;
}

export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value;
  if (typeof value === "bigint") return new Date(Number(value));
  if (typeof value === "number") return new Date(value);
  const n = Number(value);
  if (Number.isFinite(n) && String(value).trim() !== "") return new Date(n);
  const d = new Date(String(value).replace(" ", "T") + (String(value).includes("Z") ? "" : "Z"));
  return Number.isNaN(d.getTime()) ? new Date(String(value)) : d;
}

/* ---------------- Settings ---------------- */

export async function readSettingRows(): Promise<{ key: string; value: string }[]> {
  await ensureF2CTables();
  const rows = await prisma.$queryRawUnsafe<{ key: string; value: string }[]>(`SELECT "key", "value" FROM "AppSetting"`);
  return rows.map((r) => ({ key: String(r.key), value: String(r.value) }));
}

export async function writeSetting(key: string, value: string) {
  await ensureF2CTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "AppSetting" ("key", "value", "updatedAt") VALUES (?, ?, ?)
     ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = excluded."updatedAt"`,
    key,
    value,
    Date.now()
  );
}

/* ---------------- Customer accounts ---------------- */

export type CustomerRow = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

function mapCustomer(r: Record<string, unknown> | undefined): CustomerRow | null {
  if (!r) return null;
  return {
    id: Number(r.id),
    name: String(r.name ?? ""),
    mobile: String(r.mobile ?? ""),
    email: r.email ? String(r.email) : null,
    passwordHash: String(r.passwordHash ?? ""),
    referralCode: String(r.referralCode ?? ""),
    referredBy: r.referredBy ? String(r.referredBy) : null,
    active: r.active === true || r.active === 1 || r.active === BigInt(1) || r.active === "1" || r.active === "true",
    lastLoginAt: toDate(r.lastLoginAt),
    createdAt: toDate(r.createdAt) || new Date(),
  };
}

async function findOne(where: "id" | "mobile" | "referralCode", value: string | number) {
  await ensureF2CTables();
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM "CustomerAccount" WHERE "${where}" = ? LIMIT 1`,
    value
  );
  return mapCustomer(rows[0]);
}

export const customers = {
  byId: (id: number) => findOne("id", id),
  byMobile: (mobile: string) => findOne("mobile", mobile),
  byReferralCode: (code: string) => findOne("referralCode", code),

  async create(data: { name: string; mobile: string; passwordHash: string; referralCode: string; referredBy: string | null }) {
    await ensureF2CTables();
    const now = Date.now();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CustomerAccount" ("name", "mobile", "email", "passwordHash", "referralCode", "referredBy", "active", "lastLoginAt", "createdAt", "updatedAt")
       VALUES (?, ?, NULL, ?, ?, ?, 1, ?, ?, ?)`,
      data.name,
      data.mobile,
      data.passwordHash,
      data.referralCode,
      data.referredBy,
      now,
      now,
      now
    );
    return findOne("mobile", data.mobile);
  },

  async update(id: number, data: Partial<{ name: string; email: string | null; passwordHash: string; lastLoginAt: number; referralCode: string }>) {
    await ensureF2CTables();
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (!["name", "email", "passwordHash", "lastLoginAt", "referralCode"].includes(k)) continue;
      sets.push(`"${k}" = ?`);
      values.push(v);
    }
    sets.push(`"updatedAt" = ?`);
    values.push(Date.now());
    await prisma.$executeRawUnsafe(`UPDATE "CustomerAccount" SET ${sets.join(", ")} WHERE "id" = ?`, ...values, id);
    return findOne("id", id);
  },

  async countReferredBy(code: string) {
    await ensureF2CTables();
    const rows = await prisma.$queryRawUnsafe<{ n: unknown }[]>(`SELECT COUNT(*) AS n FROM "CustomerAccount" WHERE "referredBy" = ?`, code);
    return Number(rows[0]?.n || 0);
  },

  async list(limit = 2000) {
    await ensureF2CTables();
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CustomerAccount" ORDER BY "id" DESC LIMIT ?`,
      limit
    );
    return rows.map((r) => mapCustomer(r)!).filter(Boolean);
  },
};
