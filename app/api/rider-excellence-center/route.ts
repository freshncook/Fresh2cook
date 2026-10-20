import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const riders =
    await prisma.deliveryBoy.findMany();

  return NextResponse.json({
    success: true,
    totalRiders: riders.length,
    averageRating:
      riders.length > 0
        ? riders.reduce(
            (sum, r) =>
              sum + r.rating,
            0
          ) / riders.length
        : 0,
    riders,
  });
}




