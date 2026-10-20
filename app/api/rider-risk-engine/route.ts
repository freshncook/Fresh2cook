import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const riders = await prisma.deliveryBoy.findMany();

  const risk = riders.map((rider) => ({
    riderId: rider.id,
    name: rider.name,
    riskLevel:
      rider.rating < 4
        ? "High"
        : rider.rating < 4.5
        ? "Medium"
        : "Low",
  }));

  return NextResponse.json({
    success: true,
    risk,
  });
}




