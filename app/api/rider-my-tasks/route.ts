import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// DeliveryAssignment has no Prisma relation to Order in schema.prisma, so
// `include: { order }` throws. Load the orders separately and attach them.
async function attachOrders<T extends { orderId: number }>(assignments: T[]) {
  const orderIds = [...new Set(assignments.map((a) => a.orderId))];
  const orders = orderIds.length
    ? await prisma.order.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, customer: true, address: true, amount: true, status: true }, // no customer phone for riders
      })
    : [];
  const byId = new Map(orders.map((o) => [o.id, o]));
  return assignments.map((a) => ({ ...a, order: byId.get(a.orderId) || null }));
}

function getRiderId(req: NextRequest): number | null {
  const token = req.cookies.get("f2c_rider_session")?.value;
  const secret = process.env.RIDER_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const expected = createHmac("sha256", secret)
      .update(parts[0])
      .digest();
    const supplied = Buffer.from(parts[1], "base64url");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) return null;

    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    );

    if (
      !Number.isInteger(payload.riderId) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now()
    ) return null;

    return payload.riderId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const riderId = getRiderId(req);

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: "Please log in again", tasks: [] },
        { status: 401 }
      );
    }

    const rider = await prisma.deliveryBoy.findUnique({
      where: { id: riderId },
      select: { id: true, approvalStatus: true },
    });

    if (!rider || rider.approvalStatus !== "Approved") {
      return NextResponse.json(
        { success: false, error: "Rider account is not approved", tasks: [] },
        { status: 403 }
      );
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryBoyId: riderId },
      orderBy: { assignedAt: "desc" },
    });

    const tasks = await attachOrders(assignments);

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("RIDER MY TASKS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Could not load tasks", tasks: [] },
      { status: 500 }
    );
  }
}
