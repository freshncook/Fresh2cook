import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany();

    const candidates =
      assignments.filter(
        (a) =>
          a.lateDelivery === true &&
          a.status !== "Delivered"
      );

    return NextResponse.json({
      success: true,
      count: candidates.length,
      assignments: candidates,
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



