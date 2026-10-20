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
      await prisma.deliveryBoy.findUnique(
        {
          where: {
            id: riderId,
          },
        }
      );

    if (!rider) {
      return NextResponse.json(
        {
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.deliveryBoy.update(
      {
        where: {
          id: riderId,
        },

        data: {
          latitude:
            Number(
              body.latitude || 0
            ),

          longitude:
            Number(
              body.longitude || 0
            ),

          speed:
            Number(
              body.speed || 0
            ),

          lastSeen:
            new Date(),

          status:
            "Online",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Location Updated",
    });
  } catch (error) {
    console.error(
      "LOCATION UPDATE ERROR:",
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

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany(
        {
          select: {
            id: true,
            name: true,
            mobile: true,
            vehicle: true,
            status: true,
            latitude: true,
            longitude: true,
            speed: true,
            lastSeen: true,
            rating: true,
            completedDeliveries: true,
          },
        }
      );

    return NextResponse.json(
      riders
    );
  } catch (error) {
    console.error(
      "GET LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Locations",
      },
      {
        status: 500,
      }
    );
  }
}




