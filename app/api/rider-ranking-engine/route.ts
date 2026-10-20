import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders = await prisma.deliveryBoy.findMany({
      orderBy: [
        { completedDeliveries: "desc" },
        { rating: "desc" },
      ],
    });

    const ranking = riders.map((rider, index) => ({
      rank: index + 1,
      riderId: rider.id,
      name: rider.name,
      rating: rider.rating,
      deliveries: rider.completedDeliveries,
      earnings: rider.earnings,
    }));

    return NextResponse.json({
      success: true,
      ranking,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ranking Engine Failed" },
      { status: 500 }
    );
  }
}




