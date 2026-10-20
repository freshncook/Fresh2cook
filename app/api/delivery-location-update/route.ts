import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const riderId = Number(
      body.riderId
    );

    if (!riderId) {
      return NextResponse.json(
        {
          error:
            "Rider ID Required",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.update({
        where: {
          id: riderId,
        },
        data: {
          latitude:
            body.latitude,

          longitude:
            body.longitude,

          speed:
            body.speed || 0,

          lastSeen:
            new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error(
      "LOCATION UPDATE ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Update Location",
      },
      {
        status: 500,
      }
    );
  }
}




