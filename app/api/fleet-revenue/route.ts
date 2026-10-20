import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const totalRevenue =
      riders.reduce(
        (sum, rider) =>
          sum + (rider.earnings || 0),
        0
      );

    return NextResponse.json({
      success: true,
      totalRevenue,
      totalRiders: riders.length,
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





