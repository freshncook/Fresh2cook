import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const twoHoursAgo =
      new Date(
        Date.now() -
          2 * 60 * 60 * 1000
      );

    const overdueOrders =
      await prisma.deliveryAssignment.findMany(
        {
          where: {
            status: {
              in: [
                "Assigned",
                "Accepted",
                "Out For Delivery",
              ],
            },

            assignedAt: {
              lte:
                twoHoursAgo,
            },
          },
        }
      );

    let alertCount = 0;

    for (const order of overdueOrders) {
      const rider =
        await prisma.deliveryBoy.findUnique(
          {
            where: {
              id:
                order.deliveryBoyId,
            },
          }
        );

      if (!rider) continue;

      const currentRating =
        Number(
          rider.rating || 5
        );

      const newRating =
        Math.max(
          1,
          currentRating -
            0.2
        );

      await prisma.deliveryBoy.update(
        {
          where: {
            id:
              rider.id,
          },

          data: {
            rating:
              Number(
                newRating.toFixed(
                  1
                )
              ),
          },
        }
      );

      await prisma.notification.create(
        {
          data: {
            title:
              "Late Delivery Alert",

            message: `Order #${order.orderId} delayed more than 2 hours. Rider: ${rider.name}`,

            read: false,
          },
        }
      );

      alertCount++;
    }

    return NextResponse.json({
      success: true,
      overdueOrders:
        overdueOrders.length,
      alertsCreated:
        alertCount,
      message: `${alertCount} overdue delivery alerts created`,
    });
  } catch (error) {
    console.error(
      "OVERDUE ALERT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Check Overdue Deliveries",
      },
      {
        status: 500,
      }
    );
  }
}




