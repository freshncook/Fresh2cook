import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const deliveredOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: "Delivered",
        },
      });

    const pendingOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: {
            not: "Delivered",
          },
        },
      });

    const revenue =
      deliveredOrders * 40;

    return NextResponse.json({
      totalRiders:
        riders.length,

      deliveredOrders,

      pendingOrders,

      revenue,

      riders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed To Load Analytics",
      },
      {
        status: 500,
      }
    );
  }
}




