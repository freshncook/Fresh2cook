import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const incentives =
      riders.map((rider) => {
        const deliveries =
          rider.completedDeliveries || 0;

        let incentive = 0;

        if (deliveries >= 500)
          incentive = 5000;
        else if (
          deliveries >= 250
        )
          incentive = 1500;
        else if (
          deliveries >= 100
        )
          incentive = 500;

        return {
          riderId: rider.id,
          riderName:
            rider.name,
          deliveries,
          incentive,
        };
      });

    return NextResponse.json({
      success: true,
      incentives,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed To Load Incentives",
      },
      {
        status: 500,
      }
    );
  }
}




