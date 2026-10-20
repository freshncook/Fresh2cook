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

    const riders =
      await prisma.deliveryBoy.count();

    const infinityScore =
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
      riders,
      infinityScore,
      generatedAt:
        new Date(),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Infinity Dashboard Failed",
      },
      {
        status: 500,
      }
    );
  }
}




