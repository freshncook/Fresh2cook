import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const threeMinutesAgo =
      new Date(
        Date.now() -
          3 * 60 * 1000
      );

    const pendingAssignments =
      await prisma.deliveryAssignment.findMany(
        {
          where: {
            status:
              "Assigned",

            assignedAt: {
              lte:
                threeMinutesAgo,
            },
          },
        }
      );

    let reassignedCount = 0;

    for (const assignment of pendingAssignments) {
      const currentRider =
        assignment.deliveryBoyId;

      const riders =
        await prisma.deliveryBoy.findMany(
          {
            where: {
              status:
                "Online",
            },
          }
        );

      const availableRiders =
        riders.filter(
          (rider) =>
            rider.id !==
            currentRider
        );

      if (
        availableRiders.length ===
        0
      ) {
        continue;
      }

      const riderLoads =
        await Promise.all(
          availableRiders.map(
            async (rider) => {
              const activeOrders =
                await prisma.deliveryAssignment.count(
                  {
                    where: {
                      deliveryBoyId:
                        rider.id,
                      status: {
                        in: [
                          "Assigned",
                          "Accepted",
                        ],
                      },
                    },
                  }
                );

              return {
                rider,
                activeOrders,
              };
            }
          )
        );

      riderLoads.sort(
        (a, b) =>
          a.activeOrders -
          b.activeOrders
      );

      const nextRider =
        riderLoads[0]?.rider;

      if (!nextRider)
        continue;

      await prisma.deliveryAssignment.update(
        {
          where: {
            id:
              assignment.id,
          },

          data: {
            deliveryBoyId:
              nextRider.id,

            assignedAt:
              new Date(),

            status:
              "Assigned",
          },
        }
      );

      reassignedCount++;
    }

    return NextResponse.json({
      success: true,
      reassignedCount,
      message: `${reassignedCount} orders reassigned successfully`,
    });
  } catch (error) {
    console.error(
      "REASSIGN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Reassign Orders",
      },
      {
        status: 500,
      }
    );
  }
}




