import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany();

    const zones: Record<
      string,
      {
        totalOrders: number;
        deliveredOrders: number;
        revenue: number;
      }
    > = {};

    orders.forEach((order: any) => {
      const zone = "Default Zone";

      if (!zones[zone]) {
        zones[zone] = {
          totalOrders: 0,
          deliveredOrders: 0,
          revenue: 0,
        };
      }

      zones[zone].totalOrders += 1;

      if (order.status === "Delivered") {
        zones[zone].deliveredOrders += 1;
      }

      zones[zone].revenue += Number(order.amount || 0);
    });

    return NextResponse.json({
      success: true,
      zones,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load zone performance",
      },
      { status: 500 }
    );
  }
}




