import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const assignments =
    await prisma.deliveryAssignment.findMany({
      where: {
        pickupDeadline: null,
      },
    });

  for (const item of assignments) {

    await prisma.deliveryAssignment.update({
      where: {
        id: item.id,
      },

      data: {
        pickupDeadline:
          new Date(
            item.assignedAt.getTime() +
            180000
          ),
      },
    });
  }

  return NextResponse.json({
    success: true,
    fixed: assignments.length,
  });
}




