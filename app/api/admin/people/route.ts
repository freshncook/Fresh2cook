import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { customers } from "@/lib/f2c-db";
import { missing, readKyc, readKycMap, saveKyc, type KycKind } from "@/lib/kyc";
import { addLedger, staffWallet } from "@/lib/staff-wallet";
import { readUpiMap } from "@/lib/rider-wallet";
import { packingStats } from "@/lib/staff-tools";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

/*
 * Admin > People — 4 sections: customers, processing staff, riders, admins.
 *   GET ?tab=customers|staff|riders|admins
 *   POST { action: "kycStatus", kind: "rider"|"staff", id, status: "Approved"|"Rejected", note? }
 *        { action: "salary", id, salary }                  (staff monthly salary)
 *        { action: "ledger", id, type: "Advance"|"Paid", amount, note? }   (staff wallet)
 *        { action: "active", id, active }                  (staff login on / off)
 */

export async function GET(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const tab = new URL(req.url).searchParams.get("tab") || "riders";

  if (tab === "customers") {
    const list = await customers.list(500).catch(() => []);
    const orders = await prisma.order.findMany({ select: { phone: true, amount: true } }).catch(() => [] as { phone: string | null; amount: number }[]);
    const byPhone = new Map<string, { count: number; sum: number }>();
    for (const o of orders) {
      const k = String(o.phone || "").replace(/\D/g, "").slice(-10);
      const v = byPhone.get(k) || { count: 0, sum: 0 };
      v.count++;
      v.sum += Number(o.amount || 0);
      byPhone.set(k, v);
    }
    return NextResponse.json({
      success: true,
      customers: list.map((c) => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        email: c.email,
        referralCode: c.referralCode,
        joined: c.createdAt,
        lastLogin: c.lastLoginAt,
        orders: byPhone.get(c.mobile)?.count || 0,
        spent: byPhone.get(c.mobile)?.sum || 0,
      })),
    });
  }

  if (tab === "summary") {
    // how many KYC forms are waiting for review (badges on the section cards)
    const [staffMap, riderMap] = await Promise.all([readKycMap("staff"), readKycMap("rider")]);
    const count = (m: Record<string, { status?: string }>) => Object.values(m).filter((k) => k?.status === "Submitted").length;
    return NextResponse.json({ success: true, pending: { staff: count(staffMap), riders: count(riderMap) } });
  }

  if (tab === "staff" || tab === "admins") {
    const kycMap = await readKycMap("staff");
    const all = await prisma.staffUser.findMany({
      where: { role: { in: ["PROCESSING", "SUPER_ADMIN"] } },
      select: { id: true, name: true, mobile: true, role: true, active: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    // Staff tab: processing staff + any admin who also sent staff KYC. Admins tab: all admins.
    const staff =
      tab === "admins"
        ? all.filter((s) => s.role === "SUPER_ADMIN")
        : all.filter((s) => s.role === "PROCESSING" || ["Submitted", "Approved", "Rejected"].includes(String(kycMap[String(s.id)]?.status || "")));
    const reward = Number((await getStoreSettings()).processingReward ?? 5);
    const list = await Promise.all(
      staff.map(async (s) => {
        const kyc = await readKyc("staff", s.id);
        const [wallet, st] = await Promise.all([staffWallet(s.id, 3), packingStats(s.id, reward)]);
        return { ...s, kyc, missing: missing("staff", kyc), wallet, packedTotal: st.total, packedMonth: st.month };
      })
    );
    return NextResponse.json({ success: true, [tab]: list });
  }

  // riders
  const riders = await prisma.deliveryBoy.findMany({
    select: { id: true, name: true, mobile: true, vehicle: true, approvalStatus: true, status: true, completedDeliveries: true, createdAt: true },
    orderBy: { id: "desc" },
  });
  const upi = await readUpiMap();
  const list = await Promise.all(
    riders.map(async (r) => {
      const kyc = await readKyc("rider", r.id);
      return { ...r, kyc, missing: missing("rider", kyc), upi: upi[String(r.id)] || "" };
    })
  );
  return NextResponse.json({ success: true, riders: list });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  if (action === "kycStatus") {
    const kind = (body.kind === "staff" ? "staff" : "rider") as KycKind;
    const status = body.status === "Rejected" ? "Rejected" : "Approved";
    await saveKyc(kind, id, { status, note: String(body.note || "") }, { admin: true });
    return NextResponse.json({ success: true });
  }
  if (action === "salary") {
    await saveKyc("staff", id, { salary: Number(body.salary) || 0 }, { admin: true });
    return NextResponse.json({ success: true });
  }
  if (action === "ledger") {
    const amount = Math.round(Number(body.amount) || 0);
    if (amount <= 0) return NextResponse.json({ success: false, error: "Enter the amount" }, { status: 400 });
    await addLedger({ staffId: id, type: body.type === "Paid" ? "Paid" : "Advance", amount, note: String(body.note || "").slice(0, 120) });
    return NextResponse.json({ success: true });
  }
  if (action === "active") {
    await prisma.staffUser.update({ where: { id }, data: { active: Boolean(body.active) } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
