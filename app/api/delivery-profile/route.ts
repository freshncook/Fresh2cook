import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const riderId = Number(
      searchParams.get("id")
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

    return NextResponse.json(
      rider
    );
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Profile",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    const riderId = Number(
      body.id
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

    const updated =
      await prisma.deliveryBoy.update({
        where: {
          id: riderId,
        },
        data: {
          name:
            body.name || "",

          mobile:
            body.mobile || "",

          password:
            body.password || "",

          vehicle:
            body.vehicle || "",

          aadhaar:
            body.aadhaar || "",

          photo:
            body.photo || null,
        },
      });

    return NextResponse.json({
      success: true,
      rider: updated,
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Update Profile",
      },
      {
        status: 500,
      }
    );
  }
}




