import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalOrders =
      await prisma.deliveryAssignment.count();

    const deliveredOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: "Delivered",
        },
      });

    const pendingOrders =
      totalOrders -
      deliveredOrders;

    const neuralScore =
      totalOrders > 0
        ? Number(
            (
              (deliveredOrders /
                totalOrders) *
              100
            ).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      success: true,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      neuralScore,
      engineStatus:
        neuralScore >= 90
          ? "Excellent"
          : neuralScore >= 75
          ? "Good"
          : "Needs Attention",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Neural Engine Failed",
      },
      {
        status: 500,
      }
    );
  }
}




