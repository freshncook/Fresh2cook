import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/*
 * Admin dashboard — LIVE numbers straight from the database.
 * No dummy data. Every number here comes from Order, OrderItem,
 * DeliveryAssignment, DeliveryBoy and Product tables.
 * "Today" is calculated in India time (IST), whatever the server timezone is.
 */

const IST_OFFSET = 330 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

function istDayStart(date: Date) {
  return new Date(
    Math.floor((date.getTime() + IST_OFFSET) / DAY) * DAY - IST_OFFSET
  );
}

function istDayKey(date: Date) {
  return new Date(date.getTime() + IST_OFFSET).toISOString().slice(0, 10);
}

const NEW_STATUSES = ["Pending", "Confirmed", "Paid", "Payment Received"];
const ON_THE_WAY_STATUSES = ["Assigned To Rider", "Out For Delivery"];
const ACTIVE_ASSIGNMENT_STATUSES = [
  "Pending Acceptance",
  "Accepted",
  "Picked Up",
  "Otp Sent",
  "Out For Delivery",
];

function percentChange(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? null : 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

function stageOf(status: string) {
  if (NEW_STATUSES.includes(status)) return "new";
  if (status === "Processing") return "processing";
  if (status === "Ready For Dispatch") return "ready";
  if (ON_THE_WAY_STATUSES.includes(status)) return "onTheWay";
  if (status === "Delivered") return "delivered";
  if (status === "Cancelled") return "cancelled";
  return "other";
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = istDayStart(now);
    const yesterdayStart = new Date(todayStart.getTime() - DAY);
    const weekStart = new Date(todayStart.getTime() - 6 * DAY);

    const [
      weekOrders,
      allCustomers,
      openOrders,
      deliveredToday,
      activeDeliveries,
      ridersOnline,
      ridersPending,
      lowStock,
      recentOrders,
      todayAssignments,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { id: true, amount: true, status: true, createdAt: true, customer: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        select: { customer: true, phone: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: { status: { notIn: ["Delivered", "Cancelled"] } },
        select: { id: true, status: true, processingDeadline: true },
      }),
      prisma.deliveryAssignment.count({
        where: { status: "Delivered", deliveredAt: { gte: todayStart } },
      }),
      prisma.deliveryAssignment.count({
        where: { status: { in: ACTIVE_ASSIGNMENT_STATUSES } },
      }),
      prisma.deliveryBoy.count({
        where: { approvalStatus: "Approved", status: { not: "Offline" } },
      }),
      prisma.deliveryBoy.count({ where: { approvalStatus: "Pending" } }),
      prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
      prisma.order.findMany({
        orderBy: { id: "desc" },
        take: 8,
        select: { id: true, customer: true, amount: true, status: true, createdAt: true },
      }),
      prisma.deliveryAssignment.findMany({
        where: {
          OR: [
            { assignedAt: { gte: todayStart } },
            { deliveredAt: { gte: todayStart } },
          ],
        },
        select: { orderId: true, deliveryBoyId: true, assignedAt: true, deliveredAt: true, status: true },
      }),
    ]);

    /* ---------- KPIs ---------- */
    const todayOrders = weekOrders.filter((o) => o.createdAt >= todayStart);
    const yesterdayOrders = weekOrders.filter(
      (o) => o.createdAt >= yesterdayStart && o.createdAt < todayStart
    );
    const revenueOf = (list: typeof weekOrders) =>
      list
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const firstSeen = new Map<string, Date>();
    for (const c of allCustomers) {
      const key = (c.phone || "").trim() || (c.customer || "").trim().toLowerCase();
      if (key && !firstSeen.has(key)) firstSeen.set(key, c.createdAt);
    }
    let newCustomersToday = 0;
    for (const date of firstSeen.values()) if (date >= todayStart) newCustomersToday++;

    /* ---------- Last 7 days ---------- */
    const trend: { date: string; label: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart.getTime() - i * DAY);
      const key = istDayKey(dayStart);
      const dayOrders = weekOrders.filter((o) => istDayKey(o.createdAt) === key);
      trend.push({
        date: key,
        label: i === 0 ? "Today" : new Date(dayStart.getTime() + IST_OFFSET).toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
        orders: dayOrders.length,
        revenue: revenueOf(dayOrders),
      });
    }

    /* ---------- Live pipeline ---------- */
    const pipeline = { new: 0, processing: 0, ready: 0, onTheWay: 0, delivered: deliveredToday, cancelled: 0 };
    for (const o of openOrders) {
      const stage = stageOf(o.status);
      if (stage in pipeline && stage !== "delivered") {
        pipeline[stage as keyof typeof pipeline]++;
      }
    }
    pipeline.cancelled = todayOrders.filter((o) => o.status === "Cancelled").length;

    const lateOrders = openOrders.filter(
      (o) => o.status === "Processing" && o.processingDeadline && o.processingDeadline < now
    ).length;

    /* ---------- Recent orders (+ item count, rider) ---------- */
    const recentIds = recentOrders.map((o) => o.id);
    const [itemGroups, recentAssignments] = await Promise.all([
      prisma.orderItem.groupBy({
        by: ["orderId"],
        where: { orderId: { in: recentIds } },
        _sum: { quantity: true },
      }),
      prisma.deliveryAssignment.findMany({
        where: { orderId: { in: recentIds } },
        select: { orderId: true, deliveryBoyId: true, assignedAt: true },
        orderBy: { assignedAt: "desc" },
      }),
    ]);

    const riderIds = [
      ...new Set([
        ...recentAssignments.map((a) => a.deliveryBoyId),
        ...todayAssignments.map((a) => a.deliveryBoyId),
      ]),
    ];
    const riders = riderIds.length
      ? await prisma.deliveryBoy.findMany({
          where: { id: { in: riderIds } },
          select: { id: true, name: true },
        })
      : [];
    const riderName = new Map(riders.map((r) => [r.id, r.name]));
    const itemsByOrder = new Map(itemGroups.map((g) => [g.orderId, Number(g._sum.quantity || 0)]));
    const riderByOrder = new Map<number, string>();
    for (const a of recentAssignments) {
      if (!riderByOrder.has(a.orderId)) riderByOrder.set(a.orderId, riderName.get(a.deliveryBoyId) || "");
    }

    const recent = recentOrders.map((o) => ({
      id: o.id,
      customer: o.customer,
      items: itemsByOrder.get(o.id) || 0,
      amount: Number(o.amount || 0),
      status: o.status,
      createdAt: o.createdAt,
      rider: riderByOrder.get(o.id) || null,
    }));

    /* ---------- Today's activity (real events) ---------- */
    type Activity = { at: Date; type: string; text: string };
    const activity: Activity[] = [];
    for (const o of todayOrders) {
      activity.push({ at: o.createdAt, type: "order", text: `New order #${o.id} from ${o.customer}` });
    }
    for (const a of todayAssignments) {
      const name = riderName.get(a.deliveryBoyId) || "rider";
      if (a.assignedAt >= todayStart) {
        activity.push({ at: a.assignedAt, type: "assign", text: `Order #${a.orderId} assigned to ${name}` });
      }
      if (a.deliveredAt && a.deliveredAt >= todayStart) {
        activity.push({ at: a.deliveredAt, type: "delivered", text: `Order #${a.orderId} delivered by ${name}` });
      }
    }
    activity.sort((a, b) => b.at.getTime() - a.at.getTime());

    return NextResponse.json({
      success: true,
      generatedAt: now,
      kpis: {
        ordersToday: todayOrders.length,
        ordersChange: percentChange(todayOrders.length, yesterdayOrders.length),
        revenueToday: revenueOf(todayOrders),
        revenueChange: percentChange(revenueOf(todayOrders), revenueOf(yesterdayOrders)),
        totalCustomers: firstSeen.size,
        newCustomersToday,
        activeDeliveries,
        ridersOnline,
      },
      attention: {
        waitingToAccept: pipeline.new,
        readyNoRider: pipeline.ready,
        lateOrders,
        ridersPending,
        lowStock,
      },
      trend,
      pipeline,
      recent,
      activity: activity.slice(0, 8),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD LIVE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not load dashboard" },
      { status: 500 }
    );
  }
}
