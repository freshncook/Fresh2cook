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

    const updateData: any = {
      vehicle: body.vehicle ?? rider.vehicle,

photo: body.photo ?? rider.photo,

aadhaarFront:
  body.aadharFile ?? rider.aadhaarFront,

licenseFile:
  body.licenseFile ?? rider.licenseFile,

rcFile:
  body.rcFile ?? rider.rcFile,
    };

    if (
      body.password &&
      body.password.trim() !== ""
    ) {
      updateData.password =
        body.password;
    }

    const updatedRider =
      await prisma.deliveryBoy.update(
        {
          where: {
            id: riderId,
          },
          data: updateData,
        }
      );

    return NextResponse.json({
      success: true,
      rider: updatedRider,
      message:
        "Profile Updated Successfully",
    });
  } catch (error) {
    console.error(
      "UPDATE RIDER PROFILE ERROR",
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




