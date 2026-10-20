import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const totalRevenue =
      riders.reduce(
        (sum, r) =>
          sum + (r.earnings || 0),
        0
      );

    const estimatedCost =
      riders.length * 500;

    return NextResponse.json({
      success: true,
      revenue: totalRevenue,
      cost: estimatedCost,
      profit:
        totalRevenue -
        estimatedCost,
    });
  } catch (error:any) {
    return NextResponse.json(
      {
        success:false,
        error:error?.message
      },
      { status:500 }
    );
  }
}





