import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.count();

    const onlineRiders =
      await prisma.deliveryBoy.count({
        where: {
          status:
            "Available",
        },
      });

    const activeOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: {
            in: [
              "Assigned",
              "Accepted",
              "Picked",
            ],
          },
        },
      });

    const deliveredToday =
      await prisma.deliveryAssignment.count({
        where: {
          status:
            "Delivered",
        },
      });

    return NextResponse.json({
      success: true,
      riders,
      onlineRiders,
      activeOrders,
      deliveredToday,
      generatedAt:
        new Date(),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Supreme Command Center Failed",
      },
      {
        status: 500,
      }
    );
  }
}




