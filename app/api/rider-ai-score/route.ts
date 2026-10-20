import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders = await prisma.deliveryBoy.findMany();

    const scores = riders.map((rider) => ({
      riderId: rider.id,
      name: rider.name,
      aiScore:
        Math.round(
          rider.rating * 20 +
          rider.completedDeliveries / 10
        ),
    }));

    return NextResponse.json({
      success: true,
      scores,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "AI Score Failed" },
      { status: 500 }
    );
  }
}




