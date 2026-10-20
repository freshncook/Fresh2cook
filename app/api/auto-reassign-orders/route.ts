import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const expiredAssignments =
      await prisma.deliveryAssignment.findMany({
        where: {
          status: {
            in: [
              "Pending Acceptance",
              "Assigned",
            ],
          },

          pickupDeadline: {
            not: null,
            lt: now,
          },
        },

        orderBy: {
          assignedAt: "asc",
        },
      });

    const results: any[] = [];

    for (const assignment of expiredAssignments) {
      const currentRider =
        await prisma.deliveryBoy.findUnique({
          where: {
            id: assignment.deliveryBoyId,
          },
        });

      const nextRider =
        await prisma.deliveryBoy.findFirst({
          where: {
            approvalStatus:
              "Approved",

            id: {
              not:
                assignment.deliveryBoyId,
            },

            status: {
              in: [
                "Online",
                "Available",
                "Active",
              ],
            },
          },

          orderBy: {
            completedDeliveries:
              "desc",
          },
        });

      if (nextRider) {
        await prisma.deliveryAssignment.update({
          where: {
            id: assignment.id,
          },

          data: {
            deliveryBoyId:
              nextRider.id,

            status:
              "Pending Acceptance",

            assignedAt:
              new Date(),

            pickupDeadline:
              new Date(
                Date.now() +
                  180 * 1000
              ),

            autoReassigned:
              true,

            reassignedAt:
              new Date(),

            adminAlert:
              true,

            alertSent:
              true,

            reassignedCount:
              assignment.reassignedCount +
              1,
          },
        });

        if (currentRider) {
          await prisma.deliveryBoy.update({
            where: {
              id: currentRider.id,
            },

            data: {
              rating:
                currentRider.rating > 1
                  ? currentRider.rating -
                    0.2
                  : 1,
            },
          });
        }

        results.push({
          assignmentId:
            assignment.id,

          orderId:
            assignment.orderId,

          previousRider:
            currentRider?.name,

          newRider:
            nextRider.name,

          action:
            "AUTO_REASSIGNED",
        });
      } else {
        await prisma.deliveryAssignment.update({
          where: {
            id: assignment.id,
          },

          data: {
            adminAlert: true,
            alertSent: true,
          },
        });

        results.push({
          assignmentId:
            assignment.id,

          orderId:
            assignment.orderId,

          action:
            "ADMIN_ALERT_ONLY",

          message:
            "No Approved Rider Available",
        });
      }
    }

    return NextResponse.json({
      success: true,

      checked:
        expiredAssignments.length,

      processed:
        results.length,

      results,
    });
  } catch (error) {
    console.error(
      "AUTO REASSIGN ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Auto Reassign Failed",
      },
      {
        status: 500,
      }
    );
  }
}




