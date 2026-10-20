import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

/*
 * Admin orders board (admin login required — contains OTPs and phone numbers).
 *   GET  -> latest orders with items, rider, delivery OTP + approved riders
 *   POST { orderId, riderId } -> assign / re-assign a rider (customer OTP is kept)
 */

const CLOSED_ASSIGNMENT = ["Rejected", "Cancelled", "Failed", "Reassigned", "Delivered"];

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      orderBy: { id: "desc" },
      take: 300,
      select: {
        id: true,
        customer: true,
        phone: true,
        address: true,
        amount: true,
        status: true,
        deliveryOtp: true,
        processingStep: true,
        createdAt: true,
      },
    });
    const ids = orders.map((o) => o.id);

    const [itemGroups, assignments, riders] = await Promise.all([
      prisma.orderItem.groupBy({ by: ["orderId"], where: { orderId: { in: ids } }, _sum: { quantity: true } }),
      prisma.deliveryAssignment.findMany({
        where: { orderId: { in: ids } },
        orderBy: { assignedAt: "desc" },
        select: { id: true, orderId: true, deliveryBoyId: true, status: true, otp: true, assignedAt: true },
      }),
      prisma.deliveryBoy.findMany({
        where: { approvalStatus: "Approved" },
        select: { id: true, name: true, mobile: true, status: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const riderName = new Map(riders.map((r) => [r.id, r.name]));
    const missingRiderIds = [...new Set(assignments.map((a) => a.deliveryBoyId))].filter((id) => !riderName.has(id));
    if (missingRiderIds.length) {
      const extra = await prisma.deliveryBoy.findMany({ where: { id: { in: missingRiderIds } }, select: { id: true, name: true } });
      for (const r of extra) riderName.set(r.id, r.name);
    }

    const items = new Map(itemGroups.map((g) => [g.orderId, Number(g._sum.quantity || 0)]));
    const latest = new Map<number, (typeof assignments)[number]>();
    for (const a of assignments) if (!latest.has(a.orderId)) latest.set(a.orderId, a);

    return NextResponse.json({
      success: true,
      riders,
      orders: orders.map((o) => {
        const a = latest.get(o.id);
        return {
          ...o,
          items: items.get(o.id) || 0,
          otp: o.deliveryOtp || (a?.otp ? a.otp : null),
          rider: a ? { id: a.deliveryBoyId, name: riderName.get(a.deliveryBoyId) || `Rider #${a.deliveryBoyId}`, status: a.status } : null,
        };
      }),
    });
  } catch (error) {
    console.error("ADMIN ORDERS BOARD ERROR:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not load orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = Number(body?.orderId);
    const riderId = Number(body?.riderId);
    if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(riderId) || riderId <= 0) {
      return NextResponse.json({ success: false, error: "Select an order and a rider." }, { status: 400 });
    }

    const [order, rider] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.deliveryBoy.findFirst({ where: { id: riderId, approvalStatus: "Approved" }, select: { id: true, name: true } }),
    ]);
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (!rider) return NextResponse.json({ success: false, error: "Rider is not approved" }, { status: 400 });
    if (["Delivered", "Cancelled"].includes(order.status)) {
      return NextResponse.json({ success: false, error: `Order is already ${order.status}` }, { status: 400 });
    }

    const active = await prisma.deliveryAssignment.findFirst({
      where: { orderId, status: { notIn: CLOSED_ASSIGNMENT } },
      orderBy: { assignedAt: "desc" },
    });
    if (active && active.deliveryBoyId === riderId) {
      return NextResponse.json({ success: true, message: `Already assigned to ${rider.name}` });
    }
    if (active && ["Picked Up", "Otp Sent", "Out For Delivery"].includes(active.status)) {
      return NextResponse.json(
        { success: false, error: "Rider has already picked up this order. Re-assign is not allowed now." },
        { status: 409 }
      );
    }

    const otp =
      order.deliveryOtp && /^\d{4,6}$/.test(order.deliveryOtp)
        ? order.deliveryOtp
        : Math.floor(1000 + Math.random() * 9000).toString();
    const settings = await getStoreSettings();
    const now = new Date();

    await prisma.$transaction([
      ...(active
        ? [prisma.deliveryAssignment.update({ where: { id: active.id }, data: { status: "Reassigned", reassignedAt: now } })]
        : []),
      prisma.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId: rider.id,
          otp,
          status: "Pending Acceptance",
          earnings: settings.riderCommission,
          assignedAt: now,
          reassignedCount: active ? 1 : 0,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "Assigned To Rider",
          deliveryOtp: otp,
          processingStep: Math.max(order.processingStep || 0, 6),
          dispatchedAt: order.dispatchedAt || now,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `Order #${orderId} assigned to ${rider.name}` });
  } catch (error) {
    console.error("ADMIN ASSIGN ERROR:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Assign failed" }, { status: 500 });
  }
}
