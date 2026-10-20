import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession, cleanMobile } from "@/lib/session-helpers";
import { walletSummary } from "@/lib/wallet";

export const dynamic = "force-dynamic";

/*
 * Use wallet money on an order (payment page).
 * POST { orderId, amount }  — logged-in customer only.
 * Checks: order belongs to this customer, amount <= wallet balance, used only once per order.
 * Writes a minus entry in WalletTransaction ("Used on order #ID").
 */

export async function POST(req: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = Number(body?.orderId);
  const amount = Math.round(Number(body?.amount || 0));
  if (!Number.isInteger(orderId) || orderId <= 0 || !(amount > 0)) {
    return NextResponse.json({ success: false, error: "orderId and amount required" }, { status: 400 });
  }

  const mobile = cleanMobile(session.mobile);
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, phone: true, customer: true } });
  if (!order || cleanMobile(order.phone) !== mobile) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  const tag = `Used on order #${orderId}`;
  const already = await prisma.walletTransaction.findFirst({ where: { phone: mobile, type: tag } });
  if (already) return NextResponse.json({ success: true, used: -already.credit, already: true });

  const { balance } = await walletSummary(mobile);
  const use = Math.min(amount, balance);
  if (use <= 0) return NextResponse.json({ success: false, error: "No wallet balance" }, { status: 400 });

  await prisma.walletTransaction.create({
    data: {
      customer: order.customer || String(session.name || "Customer"),
      phone: mobile,
      credit: -use,
      type: tag,
      expiresAt: new Date(Date.now() + 3650 * 86400000),
    },
  });
  return NextResponse.json({ success: true, used: use, balance: balance - use });
}
