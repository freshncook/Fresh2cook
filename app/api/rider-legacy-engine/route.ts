import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const riders = await prisma.deliveryBoy.findMany();

  const legacy = riders.map((rider) => ({
    riderId: rider.id,
    name: rider.name,
    completedDeliveries: rider.completedDeliveries,
    legacyScore:
      rider.completedDeliveries +
      Math.round(rider.rating * 100),
  }));

  return NextResponse.json({
    success: true,
    legacy,
  });
}




