import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders = await prisma.deliveryBoy.findMany({
      where: {
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    });

    return NextResponse.json(riders);
  } catch (error) {
    console.error(
      "DELIVERY HEATMAP ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed To Load Heatmap",
      },
      {
        status: 500,
      }
    );
  }
}




