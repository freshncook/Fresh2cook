import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const total =
    await prisma.deliveryAssignment.count();

  const delivered =
    await prisma.deliveryAssignment.count({
      where: {
        status: "Delivered",
      },
    });

  const prediction =
    total === 0
      ? 0
      : Math.round(
          (delivered / total) * 100
        );

  return NextResponse.json({
    success: true,
    completionPrediction:
      prediction,
  });
}




