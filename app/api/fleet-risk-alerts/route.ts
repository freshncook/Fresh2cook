import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany();

    const alerts =
      assignments.filter(
        (a) =>
          a.lateDelivery === true
      );

    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message,
      },
      { status: 500 }
    );
  }
}



