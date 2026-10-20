import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalRiders =
      await prisma.deliveryBoy.count();

    const onlineRiders =
      await prisma.deliveryBoy.count({
        where: {
          status: {
            in: [
              "Online",
              "On Delivery",
              "Available",
            ],
          },
        },
      });

    const activeOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: {
            in: [
              "Pending Acceptance",
              "Accepted",
              "Picked Up",
              "Out For Delivery",
            ],
          },
        },
      });

    const completedOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: "Delivered",
        },
      });

    const delayedOrders =
      await prisma.deliveryAssignment.count({
        where: {
          status: {
            in: [
              "Pending Acceptance",
              "Accepted",
            ],
          },
          assignedAt: {
            lte: new Date(
              Date.now() -
                30 *
                  60 *
                  1000
            ),
          },
        },
      });

    const totalRevenue =
      await prisma.deliveryBoy.aggregate({
        _sum: {
          earnings: true,
        },
      });

    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          lastSeen: "desc",
        },
        take: 10,
      });

    const latestOrders =
      await prisma.deliveryAssignment.findMany(
        {
          orderBy: {
            assignedAt:
              "desc",
          },
          take: 15,
        }
      );

    return NextResponse.json({
      success: true,

      summary: {
        totalRiders,
        onlineRiders,
        activeOrders,
        completedOrders,
        delayedOrders,

        totalEarnings:
          totalRevenue._sum
            .earnings || 0,
      },

      riders,
      latestOrders,
    });
  } catch (error) {
    console.error(
      "CONTROL TOWER ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Control Tower",
      },
      {
        status: 500,
      }
    );
  }
}




