import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          id: "asc",
        },
      });

    const assignments =
      await prisma.deliveryAssignment.findMany({
        where: {
          status: {
            notIn: [
              "Delivered",
              "Cancelled",
            ],
          },
        },
      });

    const data = riders.map(
      (rider) => {

        const activeOrders =
          assignments.filter(
            (a) =>
              a.deliveryBoyId === rider.id
          ).length;

        const capacityLeft =
          Math.max(
            0,
            5 - activeOrders
          );

        let workload =
          "GREEN";

        if (activeOrders >= 5)
          workload = "RED";
        else if (
          activeOrders >= 3
        )
          workload = "YELLOW";

        return {
          id: rider.id,
          name: rider.name,
          mobile: rider.mobile,
          status: rider.status,
          zoneId: rider.zoneId,
          rating: rider.rating,
          completedDeliveries:
            rider.completedDeliveries,
          activeOrders,
          capacityLeft,
          workload,
        };
      }
    );

    return NextResponse.json(data);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}


