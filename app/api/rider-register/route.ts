import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const name =
      String(
        body.name || ""
      ).trim();

    const mobile =
      String(
        body.mobile || ""
      ).trim();

    const password =
      String(
        body.password || ""
      ).trim();

    const vehicle =
      String(
        body.vehicle || ""
      ).trim();

    if (
      !name ||
      !mobile ||
      !vehicle
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, Mobile And Vehicle Required",
        },
        {
          status: 400,
        }
      );
    }

    const existingRider =
      await prisma.deliveryBoy.findUnique(
        {
          where: {
            mobile,
          },
        }
      );

    if (
      existingRider
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mobile Number Already Registered",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.create(
        {
          data: {
            name,
            mobile,
            password,
            vehicle,

            address:
              body.address ||
              null,

            aadhaar:
              body.aadhaar ||
              null,

            photo:
              body.photo ||
              null,

            aadhaarFront:
              body.aadhaarFront ||
              null,

            aadhaarBack:
              body.aadhaarBack ||
              null,

            aadharFile:
              body.aadharFile ||
              null,

            licenseFile:
              body.licenseFile ||
              null,

            rcFile:
              body.rcFile ||
              null,

            approvalStatus:
              "Pending",

            status:
              "Offline",

            rating: 5,

            earnings: 0,

            completedDeliveries: 0,
          },
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Registration Submitted Successfully",

      rider: {
        id:
          rider.id,

        name:
          rider.name,

        mobile:
          rider.mobile,

        vehicle:
          rider.vehicle,

        approvalStatus:
          rider.approvalStatus,
      },
    });
  } catch (error) {
    console.error(
      "RIDER REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Registration Failed",
      },
      {
        status: 500,
      }
    );
  }
}




