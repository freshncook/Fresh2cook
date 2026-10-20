import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        where: {
          status: "Online",
        },
      });

    const suggestions =
      riders
        .sort(
          (a, b) =>
            b.completedDeliveries -
            a.completedDeliveries
        )
        .slice(0, 5)
        .map((r) => ({
          riderId: r.id,
          riderName: r.name,
          deliveries:
            r.completedDeliveries,
          rating: r.rating,
        }));

    return NextResponse.json({
      success: true,
      suggestions,
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



