import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const incentives =
      riders.map(r => ({
        riderId: r.id,
        riderName: r.name,
        deliveries: r.completedDeliveries,
        bonus:
          r.completedDeliveries >= 100
            ? 1000
            : r.completedDeliveries >= 50
            ? 500
            : 0,
      }));

    return NextResponse.json({
      success: true,
      incentives,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





