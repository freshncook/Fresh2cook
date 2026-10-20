import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const riderId = Number(
      searchParams.get(
        "riderId"
      )
    );

    if (!riderId) {
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
          success: false,
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error(
      "GET RIDER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Load Profile",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const riderId =
      Number(
        body.riderId
      );

    if (!riderId) {
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
          success: false,
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const updateData: any = {
      name:
        body.name ?? rider.name,

      vehicle:
        body.vehicle ?? rider.vehicle,

      address:
        body.address ?? rider.address,

      photo:
        body.photo ?? rider.photo,

      aadhaar:
        body.aadhaar ?? rider.aadhaar,

      aadhaarFront:
        body.aadhaarFront ?? rider.aadhaarFront,

      aadhaarBack:
        body.aadhaarBack ?? rider.aadhaarBack,

      aadharFile:
        body.aadharFile ?? rider.aadharFile,

      licenseFile:
        body.licenseFile ?? rider.licenseFile,

      rcFile:
        body.rcFile ?? rider.rcFile,
    };

    if (
      body.password &&
      String(
        body.password
      ).trim() !== ""
    ) {
      updateData.password =
        body.password;
    }

    const updatedRider =
      await prisma.deliveryBoy.update(
        {
          where: {
            id:
              riderId,
          },
          data:
            updateData,
        }
      );

    return NextResponse.json({
      success: true,
      rider:
        updatedRider,
      message:
        "Profile Updated Successfully",
    });
  } catch (error) {
    console.error(
      "UPDATE RIDER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Update Profile",
      },
      {
        status: 500,
      }
    );
  }
}





