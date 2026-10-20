import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany();

    const late =
      assignments.filter(
        a => a.lateDelivery === true
      );

    return NextResponse.json({
      success: true,
      totalAssignments: assignments.length,
      lateAssignments: late.length,
      slaPercent:
        assignments.length === 0
          ? 100
          : Math.round(
              ((assignments.length - late.length) /
                assignments.length) *
                100
            ),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





