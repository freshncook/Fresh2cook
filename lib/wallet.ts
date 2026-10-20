import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

/*
 * Wallet + Refer & Earn helpers.
 * Wallet entries live in WalletTransaction (credit > 0 = added, credit < 0 = used).
 * Referrals live in Referral (status: Pending -> Completed).
 */

export async function walletSummary(phone: string) {
  const now = new Date();
  const rows = await prisma.walletTransaction.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const active = rows.filter((r) => r.credit < 0 || r.expiresAt > now);
  const balance = Math.max(0, active.reduce((s, r) => s + Number(r.credit || 0), 0));
  const earned = rows.filter((r) => r.credit > 0).reduce((s, r) => s + r.credit, 0);
  const soonExpiring = rows
    .filter((r) => r.credit > 0 && r.expiresAt > now && r.expiresAt.getTime() - now.getTime() < 15 * 86400000)
    .reduce((s, r) => s + r.credit, 0);
  return { balance, earned, soonExpiring, transactions: rows };
}

export async function addWalletCredit(opts: { customer: string; phone: string; amount: number; type: string }) {
  if (!opts.amount || opts.amount <= 0) return null;
  const settings = await getStoreSettings();
  return prisma.walletTransaction.create({
    data: {
      customer: opts.customer,
      phone: opts.phone,
      credit: Math.round(opts.amount),
      type: opts.type,
      expiresAt: new Date(Date.now() + settings.walletExpiryDays * 86400000),
    },
  });
}

/**
 * Call after an order is delivered. If this was the customer's first delivered
 * order and they joined with a referral code, the referrer gets the reward.
 * Safe to call more than once — a referral is paid only once.
 */
export async function payReferralOnDelivery(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, phone: true, amount: true, status: true },
    });
    if (!order?.phone || order.status !== "Delivered") return;

    const referral = await prisma.referral.findFirst({
      where: { referredPhone: order.phone, status: "Pending" },
      orderBy: { createdAt: "asc" },
    });
    if (!referral) return;

    const settings = await getStoreSettings();

    // Mark completed first so a double call cannot pay twice.
    const marked = await prisma.referral.updateMany({
      where: { id: referral.id, status: "Pending" },
      data: { status: "Completed", orderAmount: Number(order.amount || 0), creditEarned: settings.referralReward },
    });
    if (marked.count !== 1) return;

    await addWalletCredit({
      customer: referral.referrerName,
      phone: referral.referrerPhone,
      amount: settings.referralReward,
      type: `Referral reward (order #${order.id})`,
    });
  } catch (error) {
    console.error("REFERRAL PAYOUT ERROR:", error);
  }
}
