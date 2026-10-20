import { prisma } from "@/lib/prisma";

/*
 * Customer-facing order data (used by My Account and Track Order).
 * The delivery OTP is shared only while the order is on its way.
 */

const OTP_VISIBLE = ["Assigned To Rider", "Picked Up", "Out For Delivery"];

export function stageOf(status: string, step: number) {
  if (status === "Cancelled") return -1;
  if (status === "Delivered") return 3;
  if (OTP_VISIBLE.includes(status)) return 2;
  if (status === "Ready For Dispatch" || step >= 5) return 1;
  return 0;
}

export async function loadCustomerOrders(where: { phone: string; id?: number }, take = 50) {
  const orders = await prisma.order.findMany({
    where: { phone: where.phone, ...(where.id ? { id: where.id } : {}) },
    orderBy: { id: "desc" },
    take,
    select: {
      id: true,
      customer: true,
      phone: true,
      address: true,
      amount: true,
      status: true,
      deliveryOtp: true,
      processingStep: true,
      readyAt: true,
      dispatchedAt: true,
      createdAt: true,
    },
  });
  const ids = orders.map((o) => o.id);

  const [items, assignments] = await Promise.all([
    prisma.orderItem.findMany({
      where: { orderId: { in: ids } },
      select: { orderId: true, productId: true, productName: true, pack: true, quantity: true, price: true },
      orderBy: { id: "asc" },
    }),
    prisma.deliveryAssignment.findMany({
      where: { orderId: { in: ids }, status: { notIn: ["Rejected", "Reassigned"] } },
      orderBy: { assignedAt: "desc" },
      select: { orderId: true, deliveryBoyId: true, status: true, assignedAt: true, pickedAt: true, deliveredAt: true },
    }),
  ]);

  const riderIds = [...new Set(assignments.map((a) => a.deliveryBoyId))];
  const riders = riderIds.length
    ? await prisma.deliveryBoy.findMany({ where: { id: { in: riderIds } }, select: { id: true, name: true, mobile: true } })
    : [];
  const riderMap = new Map(riders.map((r) => [r.id, r]));

  const itemsBy = new Map<number, typeof items>();
  for (const it of items) {
    const list = itemsBy.get(it.orderId) || [];
    list.push(it);
    itemsBy.set(it.orderId, list);
  }
  const latest = new Map<number, (typeof assignments)[number]>();
  for (const a of assignments) if (!latest.has(a.orderId)) latest.set(a.orderId, a);

  return orders.map((o) => {
    const a = latest.get(o.id);
    const rider = a ? riderMap.get(a.deliveryBoyId) : undefined;
    const onTheWay = OTP_VISIBLE.includes(o.status);
    return {
      id: o.id,
      status: o.status,
      stage: stageOf(o.status, o.processingStep || 0),
      amount: Number(o.amount || 0),
      address: o.address,
      createdAt: o.createdAt,
      packedAt: o.readyAt,
      dispatchedAt: o.dispatchedAt || a?.assignedAt || null,
      deliveredAt: a?.deliveredAt || null,
      otp: onTheWay ? o.deliveryOtp : null,
      rider: rider && onTheWay ? { name: rider.name, mobile: rider.mobile } : rider ? { name: rider.name, mobile: null } : null,
      items: (itemsBy.get(o.id) || []).map((i) => ({
        productId: i.productId,
        name: i.productName,
        pack: i.pack,
        qty: i.quantity,
        price: i.price,
      })),
    };
  });
}
