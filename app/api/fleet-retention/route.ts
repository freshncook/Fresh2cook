import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const risk =
      riders.filter(
        r =>
          r.completedDeliveries < 10
      );

    return NextResponse.json({
      success: true,
      totalRiders: riders.length,
      lowActivityRiders:
        risk.length,
      riders: risk,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





