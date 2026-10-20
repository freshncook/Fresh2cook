import { prisma } from "@/lib/prisma";
import { readSettingRows, writeSetting } from "@/lib/f2c-db";
import { getStoreSettings } from "@/lib/store-settings";
import { readKyc } from "@/lib/kyc";

/*
 * Processing staff wallet — monthly:
 *   Salary + Incentive (₹ per packed order) − Advance − Paid = Balance
 * Ledger (advance / paid) -> AppSetting "staffLedger"
 */

export type LedgerEntry = { id: number; staffId: number; type: "Advance" | "Paid"; amount: number; note: string; at: number };
const IST = 5.5 * 3600000;

export async function readLedger(): Promise<LedgerEntry[]> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === "staffLedger");
    const l = row ? JSON.parse(row.value) : [];
    return Array.isArray(l) ? l : [];
  } catch {
    return [];
  }
}

export async function addLedger(e: Omit<LedgerEntry, "id" | "at">) {
  const l = await readLedger();
  l.unshift({ ...e, id: Date.now(), at: Date.now() });
  await writeSetting("staffLedger", JSON.stringify(l.slice(0, 2000)));
}

function monthStart(offset: number) {
  const now = new Date(Date.now() + IST);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1) - IST);
}

export async function staffWallet(staffId: number, monthsBack = 6) {
  const [settings, kyc, ledger, packed] = await Promise.all([
    getStoreSettings(),
    readKyc("staff", staffId),
    readLedger(),
    prisma.order.findMany({
      where: { processingPackagingById: staffId, NOT: { status: "Cancelled" } },
      select: { processingPackagingAt: true },
    }),
  ]);
  const reward = Number(settings.processingReward ?? 5);
  const salary = Number(kyc.salary || 0);
  const mine = ledger.filter((e) => e.staffId === staffId);
  const months = Array.from({ length: monthsBack }).map((_, i) => {
    const from = monthStart(i);
    const to = monthStart(i - 1);
    const inM = (t: number | Date | null | undefined) => {
      if (!t) return false;
      const v = typeof t === "number" ? t : t.getTime();
      return v >= from.getTime() && v < to.getTime();
    };
    const orders = packed.filter((p) => inM(p.processingPackagingAt)).length;
    const incentive = orders * reward;
    const advance = mine.filter((e) => e.type === "Advance" && inM(e.at)).reduce((s, e) => s + e.amount, 0);
    const paid = mine.filter((e) => e.type === "Paid" && inM(e.at)).reduce((s, e) => s + e.amount, 0);
    return {
      from: from.toISOString(),
      label: new Date(from.getTime() + IST).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
      orders,
      salary,
      incentive,
      advance,
      paid,
      balance: salary + incentive - advance - paid,
    };
  });
  const totalIncentive = packed.length * reward;
  return {
    salary,
    reward,
    months,
    totals: {
      incentive: totalIncentive,
      advance: mine.filter((e) => e.type === "Advance").reduce((s, e) => s + e.amount, 0),
      paid: mine.filter((e) => e.type === "Paid").reduce((s, e) => s + e.amount, 0),
      thisMonthBalance: months[0]?.balance ?? 0,
    },
    ledger: mine.slice(0, 20),
  };
}
