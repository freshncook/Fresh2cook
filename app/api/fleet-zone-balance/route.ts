import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const zones: Record<string, number> = {};

    riders.forEach((r) => {
      const zone =
        String(r.zoneId || 0);

      zones[zone] =
        (zones[zone] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      zones,
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





