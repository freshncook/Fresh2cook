import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders = await prisma.deliveryBoy.findMany();

    const bonuses = riders.map((rider) => ({
      riderId: rider.id,
      name: rider.name,
      deliveries: rider.completedDeliveries,
      bonus:
        rider.completedDeliveries >= 500
          ? 5000
          : rider.completedDeliveries >= 250
          ? 2500
          : rider.completedDeliveries >= 100
          ? 1000
          : 0,
    }));

    return NextResponse.json({
      success: true,
      bonuses,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Bonus Engine Failed" },
      { status: 500 }
    );
  }
}




