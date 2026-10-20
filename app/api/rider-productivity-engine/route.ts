import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const riders =
    await prisma.deliveryBoy.findMany();

  const productivity =
    riders.map((rider) => ({
      riderId: rider.id,
      name: rider.name,
      score:
        rider.completedDeliveries +
        Math.round(rider.rating * 10),
    }));

  return NextResponse.json({
    success: true,
    productivity,
  });
}




