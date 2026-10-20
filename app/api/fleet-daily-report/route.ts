import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      riders,
      orders,
      assignments,
    ] = await Promise.all([
      prisma.deliveryBoy.count(),
      prisma.order.count(),
      prisma.deliveryAssignment.count(),
    ]);

    return NextResponse.json({
      success: true,
      reportDate:
        new Date(),
      totalRiders:
        riders,
      totalOrders:
        orders,
      totalAssignments:
        assignments,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message,
      },
      { status: 500 }
    );
  }
}



