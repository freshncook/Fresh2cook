import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { getProcessingStaff, packingStats, readRequests, readSupplies, saveRequests, saveSupplies } from "@/lib/staff-tools";
import { missing as kycMissing, readKyc, saveKyc, submitKyc } from "@/lib/kyc";
import { staffWallet } from "@/lib/staff-wallet";

export const dynamic = "force-dynamic";

/*
 * Processing staff dashboard data.
 *   GET  -> me, packing stats + reward, my packed orders, supplies, my requests, troubleshooting
 *   POST { action: "request", items: [{key, qty}], note }  -> send supply request to admin
 *        { action: "balance", key, balance }               -> update how much is left
 */

export async function GET() {
  const staff = await getProcessingStaff();
  if (!staff) return NextResponse.json({ success: false, error: "Processing session expired. Please login again." }, { status: 401 });

  const settings = await getStoreSettings();
  const reward = Number(settings.processingReward ?? 5);
  const stats = await packingStats(staff.id, reward);
  const recent = stats.packed.slice(0, 40);
  const qty = recent.length
    ? await prisma.orderItem.groupBy({ by: ["orderId"], where: { orderId: { in: recent.map((o) => o.id) } }, _sum: { quantity: true } })
    : [];
  const qtyMap = new Map(qty.map((q) => [q.orderId, Number(q._sum.quantity || 0)]));

  const [steps, overdue, waiting, supplies, requests] = await Promise.all([
    Promise.all([
      prisma.order.count({ where: { processingAcceptedById: staff.id } }),
      prisma.order.count({ where: { processingPreparedById: staff.id } }),
      prisma.order.count({ where: { processingCrossCheckedById: staff.id } }),
      prisma.order.count({ where: { processingStickerById: staff.id } }),
    ]),
    prisma.order.findMany({
      where: { status: "Processing", processingDeadline: { lt: new Date() } },
      select: { id: true, customer: true, processingStep: true, processingDeadline: true },
      orderBy: { processingDeadline: "asc" },
      take: 20,
    }),
    prisma.order.findMany({
      where: { status: "Ready For Dispatch", readyAt: { lt: new Date(Date.now() - 15 * 60000) } },
      select: { id: true, customer: true, readyAt: true },
      orderBy: { readyAt: "asc" },
      take: 20,
    }),
    readSupplies(),
    readRequests(),
  ]);

  const kyc = await readKyc("staff", staff.id);
  const wallet = await staffWallet(staff.id).catch(() => null);

  const times = stats.ok
    .slice(0, 20)
    .filter((o) => o.processingAcceptedAt && o.processingPackagingAt)
    .map((o) => (o.processingPackagingAt!.getTime() - o.processingAcceptedAt!.getTime()) / 60000);
  const avgMinutes = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return NextResponse.json({
    success: true,
    me: { id: staff.id, name: staff.name, mobile: staff.mobile, role: staff.role, since: staff.createdAt, photo: kyc.photo || "" },
    kyc: { ...kyc, salary: undefined, missing: kycMissing("staff", kyc) },
    wallet,
    stats: {
      total: stats.total,
      today: stats.today,
      week: stats.week,
      month: stats.month,
      cancelled: stats.cancelled,
      reward,
      rewardTotal: stats.rewardTotal,
      rewardWeek: stats.rewardWeek,
      rewardToday: stats.rewardToday,
      avgMinutes,
      accepted: steps[0],
      prepared: steps[1],
      crossChecked: steps[2],
      stickers: steps[3],
    },
    packed: recent.map((o) => ({
      id: o.id,
      customer: String(o.customer || "Customer").split(" ")[0],
      status: o.status,
      amount: o.amount,
      items: qtyMap.get(o.id) || 0,
      at: o.processingPackagingAt,
      reward: o.status === "Cancelled" ? 0 : reward,
    })),
    supplies,
    requests: requests.filter((r) => r.staffId === staff.id).slice(0, 20),
    troubleshoot: {
      overdue: overdue.map((o) => ({ id: o.id, customer: String(o.customer || "").split(" ")[0], step: o.processingStep, lateMin: Math.round((Date.now() - new Date(o.processingDeadline!).getTime()) / 60000) })),
      waitingRider: waiting.map((o) => ({ id: o.id, customer: String(o.customer || "").split(" ")[0], waitMin: Math.round((Date.now() - new Date(o.readyAt!).getTime()) / 60000) })),
      supportPhone: settings.supportPhone,
      serverTime: new Date().toISOString(),
    },
  });
}

export async function POST(req: Request) {
  const staff = await getProcessingStaff();
  if (!staff) return NextResponse.json({ success: false, error: "Processing session expired. Please login again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const supplies = await readSupplies();

  if (body?.action === "kyc") {
    await saveKyc("staff", staff.id, (body.data || {}) as Record<string, unknown>);
    return NextResponse.json({ success: true });
  }
  if (body?.action === "submitKyc") {
    const r = await submitKyc("staff", staff.id);
    if (!r.ok) return NextResponse.json({ success: false, error: `Please add: ${r.missing.join(", ")}` }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body?.action === "balance") {
    const key = String(body.key || "");
    const s = supplies.find((x) => x.key === key);
    if (!s) return NextResponse.json({ success: false, error: "Unknown item" }, { status: 400 });
    s.balance = Math.max(0, Math.round(Number(body.balance) || 0));
    await saveSupplies(supplies);
    return NextResponse.json({ success: true, supplies });
  }

  if (body?.action === "request") {
    const items = (Array.isArray(body.items) ? body.items : [])
      .map((i: { key?: string; qty?: number }) => {
        const s = supplies.find((x) => x.key === i?.key);
        const qty = Math.round(Number(i?.qty) || 0);
        return s && qty > 0 ? { key: s.key, name: s.name, unit: s.unit, qty, balance: s.balance } : null;
      })
      .filter(Boolean) as { key: string; name: string; unit: string; qty: number; balance: number }[];
    if (!items.length) return NextResponse.json({ success: false, error: "Tick at least one item and enter the quantity needed" }, { status: 400 });
    const requests = await readRequests();
    requests.unshift({ id: Date.now(), staffId: staff.id, staffName: staff.name, items, note: String(body.note || "").slice(0, 300), status: "Open", at: Date.now() });
    await saveRequests(requests);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
