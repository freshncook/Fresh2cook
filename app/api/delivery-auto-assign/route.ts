import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const limitTime = new Date(
      Date.now() - 3 * 60 * 1000
    );

    const expiredAssignments =
      await prisma.deliveryAssignment.findMany({
        where: {
          status: "Pending Acceptance",
          assignedAt: {
            lte: limitTime,
          },
        },
      });

    let reassigned = 0;

    for (const assignment of expiredAssignments) {
      const currentRiderId =
        assignment.deliveryBoyId;

      const nextRider =
        await prisma.deliveryBoy.findFirst({
          where: {
            status: "Available",
            id: {
              not: currentRiderId,
            },
          },
          orderBy: {
            rating: "desc",
          },
        });

      if (!nextRider) continue;

      await prisma.deliveryAssignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          deliveryBoyId:
            nextRider.id,

          assignedAt:
            new Date(),

          reassignedCount:
            assignment.reassignedCount + 1,

          autoReassigned: true,

          reassignedAt:
            new Date(),
        },
      });

      reassigned++;
    }

    return NextResponse.json({
      success: true,
      reassigned,
    });
  } catch (error) {
    console.error(
      "AUTO REASSIGN ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Auto Reassign Failed",
      },
      {
        status: 500,
      }
    );
  }
}




