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
              "Cancelled",
            ],
          },
        },
      });

    const prediction =
      pending * 25;

    return NextResponse.json({
      success: true,
      pendingOrders: pending,
      estimatedMinutes:
        prediction,
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



