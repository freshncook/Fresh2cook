import { NextResponse } from "next/server";
import { loadCustomerOrders } from "@/lib/customer-orders";
import { cleanMobile, getCustomerSession } from "@/lib/session-helpers";

export const dynamic = "force-dynamic";

/*
 * Public order tracking: needs BOTH order number and the mobile used for the order.
 * Logged-in customers can also call GET to get their latest active order.
 */

const attempts = new Map<string, { count: number; until: number }>();

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, loggedIn: false }, { status: 401 });
  const orders = await loadCustomerOrders({ phone: session.mobile }, 10);
  return NextResponse.json({ success: true, loggedIn: true, orders });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const a = attempts.get(ip);
  if (a && a.until > Date.now() && a.count >= 10) {
    return NextResponse.json({ success: false, error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const orderId = Number(String(body?.orderId || "").replace(/\D/g, ""));
  const phone = cleanMobile(body?.phone);
  if (!orderId || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ success: false, error: "Enter the order number and 10-digit mobile number." }, { status: 400 });
  }

  const [order] = await loadCustomerOrders({ phone, id: orderId }, 1);
  if (!order) {
    const cur = a && a.until > Date.now() ? a : { count: 0, until: Date.now() + 10 * 60 * 1000 };
    cur.count++;
    attempts.set(ip, cur);
    return NextResponse.json({ success: false, error: "No order found with this number for this mobile." }, { status: 404 });
  }
  return NextResponse.json({ success: true, order });
}
