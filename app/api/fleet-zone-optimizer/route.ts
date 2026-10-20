import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const zones: Record<string, any> = {};

    riders.forEach((r) => {
      const zone =
        String(r.zoneId || 0);

      if (!zones[zone]) {
        zones[zone] = {
          zoneId: zone,
          riders: 0,
          online: 0,
        };
      }

      zones[zone].riders++;

      if (r.status === "Online") {
        zones[zone].online++;
      }
    });

    return NextResponse.json({
      success: true,
      zones: Object.values(zones),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





