import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * Processing staff helpers: who is logged in, packing supplies, supply requests.
 * Supplies + requests are saved in AppSetting (no database migration needed).
 */

export const PROCESSING_ROLES = ["PROCESSING", "SUPER_ADMIN"];

export async function getProcessingStaff() {
  const s = (await getCurrentSession()) as { kind?: string; role?: string; id?: number; staffId?: number; mobile?: string; name?: string } | null;
  if (!s || s.kind !== "staff" || !PROCESSING_ROLES.includes(String(s.role).toUpperCase())) return null;
  const id = Number(s.staffId || s.id || 0);
  let staff = id > 0 ? await prisma.staffUser.findUnique({ where: { id } }) : null;
  if (!staff && s.mobile) staff = await prisma.staffUser.findUnique({ where: { mobile: String(s.mobile) } });
  if (!staff || !staff.active || !PROCESSING_ROLES.includes(String(staff.role).toUpperCase())) return null;
  return staff;
}

export type Supply = { key: string; name: string; unit: string; balance: number; min: number };
export type SupplyRequest = {
  id: number;
  staffId: number;
  staffName: string;
  items: { key: string; name: string; unit: string; qty: number; balance: number }[];
  note: string;
  status: "Open" | "Approved" | "Delivered" | "Rejected";
  at: number;
  updatedAt?: number;
};

export const DEFAULT_SUPPLIES: Supply[] = [
  { key: "bag-small", name: "Packing bags (small)", unit: "pcs", balance: 0, min: 100 },
  { key: "bag-large", name: "Packing bags (large)", unit: "pcs", balance: 0, min: 50 },
  { key: "pouch", name: "Zip-lock pouches", unit: "pcs", balance: 0, min: 200 },
  { key: "box", name: "Containers / boxes", unit: "pcs", balance: 0, min: 100 },
  { key: "sticker-brand", name: "Fresh2Cook brand stickers", unit: "pcs", balance: 0, min: 300 },
  { key: "sticker-label", name: "Product / weight labels", unit: "pcs", balance: 0, min: 300 },
  { key: "invoice-roll", name: "Invoice paper roll", unit: "rolls", balance: 0, min: 5 },
  { key: "tape", name: "Tape rolls", unit: "rolls", balance: 0, min: 5 },
  { key: "gloves", name: "Gloves", unit: "pairs", balance: 0, min: 50 },
  { key: "hairnet", name: "Hairnets", unit: "pcs", balance: 0, min: 50 },
  { key: "rubber", name: "Rubber bands", unit: "packs", balance: 0, min: 3 },
];

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === key);
    return row ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function readSupplies(): Promise<Supply[]> {
  const list = await readJson<Supply[]>("processingSupplies", []);
  return Array.isArray(list) && list.length ? list : DEFAULT_SUPPLIES;
}

export async function saveSupplies(list: Supply[]) {
  const seen = new Set<string>();
  const clean = list
    .map((s) => ({
      key: String(s.key || s.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40),
      name: String(s.name || "").trim().slice(0, 60),
      unit: String(s.unit || "pcs").trim().slice(0, 12),
      balance: Math.max(0, Math.round(Number(s.balance) || 0)),
      min: Math.max(0, Math.round(Number(s.min) || 0)),
    }))
    .filter((s) => s.key && s.name && !seen.has(s.key) && seen.add(s.key));
  await writeSetting("processingSupplies", JSON.stringify(clean));
  return clean;
}

export async function readRequests(): Promise<SupplyRequest[]> {
  const list = await readJson<SupplyRequest[]>("supplyRequests", []);
  return Array.isArray(list) ? list : [];
}

export async function saveRequests(list: SupplyRequest[]) {
  await writeSetting("supplyRequests", JSON.stringify(list.slice(0, 300)));
}

const IST = 5.5 * 3600000;
export function istDayStart(d = new Date()) {
  const t = new Date(d.getTime() + IST);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) - IST);
}
/** Monday 00:00 IST of the week of d */
export function istWeekStart(d = new Date()) {
  const day = istDayStart(d);
  const wd = new Date(day.getTime() + IST).getUTCDay(); // 0 Sun
  return new Date(day.getTime() - ((wd + 6) % 7) * 86400000);
}

/** Packing stats for one staff member */
export async function packingStats(staffId: number, reward: number) {
  const packed = await prisma.order.findMany({
    where: { processingPackagingById: staffId },
    select: { id: true, customer: true, status: true, amount: true, processingPackagingAt: true, processingAcceptedAt: true },
    orderBy: { processingPackagingAt: "desc" },
    take: 1000,
  });
  const ok = packed.filter((o) => o.status !== "Cancelled");
  const today = istDayStart();
  const week = istWeekStart();
  const month = new Date(today.getTime() - 29 * 86400000);
  const at = (o: (typeof ok)[number]) => o.processingPackagingAt || new Date(0);
  const count = (from: Date) => ok.filter((o) => at(o) >= from).length;
  return {
    packed,
    ok,
    total: ok.length,
    today: count(today),
    week: count(week),
    month: count(month),
    cancelled: packed.length - ok.length,
    reward,
    rewardTotal: ok.length * reward,
    rewardWeek: count(week) * reward,
    rewardToday: count(today) * reward,
  };
}
