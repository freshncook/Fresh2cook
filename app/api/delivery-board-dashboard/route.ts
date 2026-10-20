import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.count();

    const orders =
      await prisma.deliveryAssignment.count();

    const delivered =
      await prisma.deliveryAssignment.count({
        where: {
          status:
            "Delivered",
        },
      });

    const revenue =
      delivered * 40;

    const deliveryRate =
      orders > 0
        ? Number(
            (
              (delivered /
                orders) *
              100
            ).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      success: true,
      riders,
      orders,
      delivered,
      revenue,
      deliveryRate,
      generatedAt:
        new Date(),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Board Dashboard Failed",
      },
      {
        status: 500,
      }
    );
  }
}




