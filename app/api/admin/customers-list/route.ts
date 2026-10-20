import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { customers } from "@/lib/f2c-db";

export const dynamic = "force-dynamic";

/*
 * Admin > Customers — built from real orders + customer accounts + wallet.
 * One row per mobile number.
 */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  try {
    const [orders, accounts, wallet] = await Promise.all([
      prisma.order.findMany({
        select: { id: true, customer: true, phone: true, address: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      customers.list().catch(() => []),
      prisma.walletTransaction.findMany({ select: { phone: true, credit: true, expiresAt: true } }),
    ]);

    type Row = {
      phone: string;
      name: string;
      address: string | null;
      orders: number;
      delivered: number;
      cancelled: number;
      spent: number;
      firstOrder: Date | null;
      lastOrder: Date | null;
      hasAccount: boolean;
      joinedAt: Date | null;
      referralCode: string | null;
      wallet: number;
    };
    const map = new Map<string, Row>();
    const key = (p: string | null | undefined) => String(p || "").replace(/\D/g, "").slice(-10);
    const get = (phone: string, name: string) => {
      let r = map.get(phone);
      if (!r) {
        r = { phone, name, address: null, orders: 0, delivered: 0, cancelled: 0, spent: 0, firstOrder: null, lastOrder: null, hasAccount: false, joinedAt: null, referralCode: null, wallet: 0 };
        map.set(phone, r);
      }
      return r;
    };

    for (const o of orders) {
      const phone = key(o.phone);
      if (!phone) continue;
      const r = get(phone, o.customer);
      r.name = o.customer || r.name;
      r.address = o.address || r.address;
      r.orders++;
      if (o.status === "Delivered") {
        r.delivered++;
        r.spent += Number(o.amount || 0);
      }
      if (o.status === "Cancelled") r.cancelled++;
      r.firstOrder = r.firstOrder || o.createdAt;
      r.lastOrder = o.createdAt;
    }
    for (const a of accounts) {
      const r = get(a.mobile, a.name);
      r.hasAccount = true;
      r.joinedAt = a.createdAt;
      r.referralCode = a.referralCode;
      if (!r.orders) r.name = a.name;
    }
    const now = new Date();
    for (const w of wallet) {
      const r = map.get(key(w.phone));
      if (r && (w.credit < 0 || w.expiresAt > now)) r.wallet += w.credit;
    }

    const rows = [...map.values()].sort((a, b) => (b.lastOrder?.getTime() || b.joinedAt?.getTime() || 0) - (a.lastOrder?.getTime() || a.joinedAt?.getTime() || 0));
    return NextResponse.json({ success: true, customers: rows });
  } catch (error) {
    console.error("ADMIN CUSTOMERS ERROR:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not load" }, { status: 500 });
  }
}
