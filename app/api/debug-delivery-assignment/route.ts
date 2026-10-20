import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          assignedAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Debug Failed",
      },
      {
        status: 500,
      }
    );
  }
}




