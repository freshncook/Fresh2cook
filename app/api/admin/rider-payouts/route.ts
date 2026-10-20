import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { riderWallet } from "@/lib/rider-wallet";

export const dynamic = "force-dynamic";

/*
 * Admin > Rider Payouts (weekly)
 *   GET  -> every approved rider with UPI, earned, advance, paid, balance, this week
 *   POST { action: "advance", riderId, amount, note }  -> record advance given
 *        { action: "pay", riderId, amount, note }      -> record payout paid now
 *        { action: "markPaid", payoutId }              -> mark a requested payout as paid
 */

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const riders = await prisma.deliveryBoy.findMany({
    where: { approvalStatus: "Approved" },
    select: { id: true, name: true, mobile: true, vehicle: true },
    orderBy: { name: "asc" },
  });
  const list = await Promise.all(
    riders.map(async (r) => {
      const w = await riderWallet(r.id, 4);
      return { ...r, ...w };
    })
  );
  return NextResponse.json({ success: true, riders: list });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  if (action === "markPaid") {
    const id = Number(body.payoutId);
    await prisma.riderPayout.update({ where: { id }, data: { status: "Paid", paidAt: new Date() } });
    return NextResponse.json({ success: true });
  }
  const riderId = Number(body?.riderId);
  const amount = Math.round(Number(body?.amount || 0));
  if (!Number.isInteger(riderId) || riderId <= 0 || !(amount > 0)) {
    return NextResponse.json({ success: false, error: "Choose a rider and enter the amount" }, { status: 400 });
  }
  if (action === "advance") {
    await prisma.riderWalletTransaction.create({ data: { riderId, amount, type: "Advance", note: String(body.note || "").slice(0, 200) || null } });
    return NextResponse.json({ success: true });
  }
  if (action === "pay") {
    await prisma.riderPayout.create({ data: { riderId, amount, status: "Paid", paidAt: new Date() } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
