import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Rider = {
  id: number;
  name: string;
};

export async function GET() {
  try {
    const riders: Rider[] =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          name: "asc",
        },
      });

    const data =
      await Promise.all(
        riders.map(
          async (rider: Rider) => {
            const activeOrder =
              await prisma.deliveryAssignment.findFirst(
                {
                  where: {
                    deliveryBoyId:
                      rider.id,
                    status: {
                      in: [
                        "Pending Acceptance",
                        "Accepted",
                        "Picked Up",
                        "Out For Delivery",
                      ],
                    },
                  },
                  orderBy: {
                    assignedAt:
                      "desc",
                  },
                }
              );

            const todayDeliveries =
              await prisma.deliveryAssignment.count(
                {
                  where: {
                    deliveryBoyId:
                      rider.id,
                    status:
                      "Delivered",
                    deliveredAt: {
                      gte: new Date(
                        new Date().setHours(
                          0,
                          0,
                          0,
                          0
                        )
                      ),
                    },
                  },
                }
              );

            return {
              ...rider,

              currentOrder:
                activeOrder?.orderId ||
                null,

              currentStatus:
                activeOrder?.status ||
                "Idle",

              todayDeliveries,
            };
          }
        )
      );

    return NextResponse.json(
      data
    );
  } catch (error) {
    console.error(
      "ADMIN DELIVERY RIDERS ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Riders",
      },
      {
        status: 500,
      }
    );
  }
}




