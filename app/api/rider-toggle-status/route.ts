import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callerOf, ownsAssignment, ownsOrder } from "@/lib/caller";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();
    if (callerOf(req).kind === "rider") body.riderId = callerOf(req).id; // a rider can only change their own status

    const riderId =
      Number(
        body.riderId
      );

    const status =
      String(
        body.status || ""
      );

    if (
      !riderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider ID Required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "Online",
        "Offline",
      ].includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Status",
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
            id:
              riderId,
          },
        }
      );

    if (
      !rider
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedRider =
      await prisma.deliveryBoy.update(
        {
          where: {
            id:
              riderId,
          },
          data: {
            status,
            lastSeen:
              new Date(),
          },
        }
      );

    return NextResponse.json({
      success: true,
      message:
        `Rider ${status}`,
      rider: {
        id:
          updatedRider.id,
        name:
          updatedRider.name,
        status:
          updatedRider.status,
      },
    });
  } catch (error) {
    console.error(
      "TOGGLE STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Update Status",
      },
      {
        status: 500,
      }
    );
  }
}




