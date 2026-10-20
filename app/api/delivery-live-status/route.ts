import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    const enrichedRiders =
      await Promise.all(
        riders.map(async (rider) => {
          const pendingOrders =
            await prisma.deliveryAssignment.count({
              where: {
                deliveryBoyId: rider.id,
                status: {
                  in: [
                    "Pending Acceptance",
                    "Assigned",
                  ],
                },
              },
            });

          const activeOrders =
            await prisma.deliveryAssignment.count({
              where: {
                deliveryBoyId: rider.id,
                status: {
                  in: [
                    "Accepted",
                    "Picked Up",
                  ],
                },
              },
            });

          const reassignments =
            await prisma.deliveryAssignment.count({
              where: {
                deliveryBoyId: rider.id,
                autoReassigned: true,
              },
            });

          return {
            ...rider,
            pendingOrders,
            activeOrders,
            reassignments,
          };
        })
      );

    const adminAlerts =
      await prisma.deliveryAssignment.findMany({
        where: {
          adminAlert: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
        take: 10,
      });

    return NextResponse.json({
      riders: enrichedRiders,
      alerts: adminAlerts,
      onlineRiders:
        enrichedRiders.filter(
          (r) =>
            r.status === "Online" ||
            r.status === "Available"
        ).length,
    });
  } catch (error) {
    console.error(
      "LIVE STATUS ERROR",
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




