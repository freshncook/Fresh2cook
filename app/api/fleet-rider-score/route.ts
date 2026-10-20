import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const scores = riders.map((r) => {
      const score =
        (r.completedDeliveries * 2) +
        (r.rating * 10);

      return {
        id: r.id,
        name: r.name,
        score,
        deliveries:
          r.completedDeliveries,
        earnings: r.earnings,
        rating: r.rating,
      };
    });

    scores.sort(
      (a, b) => b.score - a.score
    );

    return NextResponse.json({
      success: true,
      riders: scores,
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



