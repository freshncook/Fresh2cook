import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, cleanMobile } from "@/lib/session-helpers";
import { customers } from "@/lib/f2c-db";
import { loadCustomerOrders } from "@/lib/customer-orders";
import { walletSummary } from "@/lib/wallet";

export const dynamic = "force-dynamic";

/* GET /api/admin/customer-detail?phone=9999901901 (admin only) */
export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  const phone = cleanMobile(new URL(req.url).searchParams.get("phone"));
  if (!/^\d{10}$/.test(phone)) return NextResponse.json({ success: false, error: "Invalid mobile" }, { status: 400 });

  try {
    const [orders, account, wallet, referrals, referredBy, lastOrder] = await Promise.all([
      loadCustomerOrders({ phone }, 100),
      customers.byMobile(phone).catch(() => null),
      walletSummary(phone),
      prisma.referral.findMany({ where: { referrerPhone: phone }, orderBy: { createdAt: "desc" } }),
      prisma.referral.findFirst({ where: { referredPhone: phone } }),
      prisma.order.findFirst({ where: { phone }, orderBy: { id: "desc" }, select: { customer: true } }),
    ]);

    // Admin sees the OTP of every order
    const otps = await prisma.order.findMany({ where: { phone }, select: { id: true, deliveryOtp: true } });
    const otpMap = new Map(otps.map((o) => [o.id, o.deliveryOtp]));

    const delivered = orders.filter((o) => o.status === "Delivered");
    return NextResponse.json({
      success: true,
      phone,
      name: account?.name || lastOrder?.customer || "Customer",
      account: account
        ? { name: account.name, email: account.email, referralCode: account.referralCode, joinedAt: account.createdAt, lastLoginAt: account.lastLoginAt, referredBy: account.referredBy }
        : null,
      stats: {
        orders: orders.length,
        delivered: delivered.length,
        spent: delivered.reduce((s, o) => s + o.amount, 0),
        cancelled: orders.filter((o) => o.status === "Cancelled").length,
      },
      orders: orders.map((o) => ({ ...o, otp: otpMap.get(o.id) || null })),
      wallet: { balance: wallet.balance, transactions: wallet.transactions.slice(0, 30) },
      referrals: referrals.map((r) => ({ id: r.id, friend: r.referredPhone, status: r.status, earned: r.creditEarned, date: r.createdAt })),
      referredBy: referredBy ? { name: referredBy.referrerName, phone: referredBy.referrerPhone, status: referredBy.status } : null,
    });
  } catch (error) {
    console.error("ADMIN CUSTOMER DETAIL ERROR:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not load" }, { status: 500 });
  }
}
