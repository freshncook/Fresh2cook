import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pending =
      await prisma.order.count({
        where: {
          status: {
            notIn: [
              "Delivered",
              "Cancelled"
            ]
          }
        }
      });

    return NextResponse.json({
      success: true,
      pendingOrders: pending,
      forecastNextHour:
        pending + Math.round(pending * 0.15),
      forecastToday:
        pending * 8,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





