import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const zones = riders.reduce(
      (acc: any, rider) => {
        const zone =
          rider.zoneId || 0;

        if (!acc[zone]) {
          acc[zone] = {
            zoneId: zone,
            riders: 0,
            online: 0,
          };
        }

        acc[zone].riders++;

        if (
          rider.status === "Online"
        ) {
          acc[zone].online++;
        }

        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      zones:
        Object.values(zones),
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



