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

    const riders =
      await prisma.deliveryBoy.count();

    return NextResponse.json({
      success: true,
      totalOrders,
      deliveredOrders,
      activeOrders,
      riders,
      generatedAt:
        new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Operations Center Failed",
      },
      {
        status: 500,
      }
    );
  }
}




