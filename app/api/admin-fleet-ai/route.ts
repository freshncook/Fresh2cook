import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      riders,
      assignments,
      orders,
    ] = await Promise.all([
      prisma.deliveryBoy.findMany(),
      prisma.deliveryAssignment.findMany(),
      prisma.order.findMany(),
    ]);

    const onlineRiders =
      riders.filter(
        (r) => r.status === "Online"
      ).length;

    const lateAssignments =
      assignments.filter(
        (a) => a.lateDelivery
      ).length;

    const deliveredOrders =
      orders.filter(
        (o) =>
          o.status ===
          "Delivered"
      ).length;

    const pendingOrders =
      orders.filter(
        (o) =>
          o.status !==
            "Delivered" &&
          o.status !==
            "Cancelled"
      ).length;

    const fleetScore =
      riders.reduce(
        (sum, r) =>
          sum +
          r.completedDeliveries,
        0
      );

    return NextResponse.json({
      success: true,
      onlineRiders,
      lateAssignments,
      deliveredOrders,
      pendingOrders,
      fleetScore,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message,
      },
      { status: 500 }
    );
  }
}




