import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          assignedAt:
            "desc",
        },
      });

    return NextResponse.json({
      success: true,
      exportedAt:
        new Date(),
      records:
        assignments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed To Export Report",
      },
      {
        status: 500,
      }
    );
  }
}




