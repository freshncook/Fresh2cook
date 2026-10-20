import { prisma } from "@/lib/prisma";
import { readSettingRows, writeSetting } from "@/lib/f2c-db";
import { istWeekStart } from "@/lib/staff-tools";

/*
 * Rider wallet: UPI id, weekly payout table (earnings − advance − paid = balance).
 *   UPI ids        -> AppSetting "riderUpi" { riderId: "name@upi" }
 *   Advance given  -> RiderWalletTransaction (type "Advance", amount > 0)
 *   Payouts        -> RiderPayout (status "Pending" = requested, "Paid" = paid)
 */

const WEEK = 7 * 86400000;

export async function readUpiMap(): Promise<Record<string, string>> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === "riderUpi");
    const m = row ? JSON.parse(row.value) : {};
    return m && typeof m === "object" ? m : {};
  } catch {
    return {};
  }
}

export async function setRiderUpi(riderId: number, upi: string) {
  const map = await readUpiMap();
  const clean = String(upi || "").trim().slice(0, 60);
  if (clean) map[String(riderId)] = clean;
  else delete map[String(riderId)];
  await writeSetting("riderUpi", JSON.stringify(map));
  return clean;
}

export function validUpi(upi: string) {
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(String(upi || "").trim());
}

export async function riderWallet(riderId: number, weeksBack = 8) {
  const [delivered, advances, payouts, upiMap] = await Promise.all([
    prisma.deliveryAssignment.findMany({
      where: { deliveryBoyId: riderId, status: "Delivered" },
      select: { earnings: true, deliveredAt: true },
    }),
    prisma.riderWalletTransaction.findMany({ where: { riderId, type: "Advance" }, orderBy: { createdAt: "desc" } }),
    prisma.riderPayout.findMany({ where: { riderId }, orderBy: { requestedAt: "desc" } }),
    readUpiMap(),
  ]);

  const thisWeek = istWeekStart();
  const weeks = Array.from({ length: weeksBack }).map((_, i) => {
    const from = new Date(thisWeek.getTime() - i * WEEK);
    const to = new Date(from.getTime() + WEEK);
    const inWeek = (d?: Date | null) => !!d && d >= from && d < to;
    const del = delivered.filter((a) => inWeek(a.deliveredAt));
    const earnings = del.reduce((s, a) => s + Number(a.earnings || 0), 0);
    const advance = advances.filter((a) => inWeek(a.createdAt)).reduce((s, a) => s + Number(a.amount || 0), 0);
    const paid = payouts.filter((p) => p.status === "Paid" && inWeek(p.paidAt)).reduce((s, p) => s + Number(p.amount || 0), 0);
    return {
      from: from.toISOString(),
      label:
        i === 0
          ? "This week"
          : `${new Date(from.getTime() + 19800000).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })} – ${new Date(to.getTime() - 86400000 + 19800000).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}`,
      deliveries: del.length,
      earnings,
      advance,
      paid,
      balance: earnings - advance - paid,
    };
  });

  const earned = delivered.reduce((s, a) => s + Number(a.earnings || 0), 0);
  const advanceTotal = advances.reduce((s, a) => s + Number(a.amount || 0), 0);
  const paidTotal = payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = payouts.filter((p) => p.status === "Pending").reduce((s, p) => s + Number(p.amount || 0), 0);
  return {
    upi: upiMap[String(riderId)] || "",
    earned,
    advanceTotal,
    paidTotal,
    pending,
    balance: earned - advanceTotal - paidTotal,
    weeks,
    advances: advances.slice(0, 10).map((a) => ({ id: a.id, amount: a.amount, note: a.note, at: a.createdAt })),
    payouts: payouts.slice(0, 10).map((p) => ({ id: p.id, amount: p.amount, status: p.status, requestedAt: p.requestedAt, paidAt: p.paidAt })),
  };
}
