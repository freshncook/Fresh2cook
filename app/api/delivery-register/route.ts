import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const existing =
      await prisma.deliveryBoy.findUnique({
        where: {
          mobile:
            body.mobile,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mobile number already registered",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.create({
        data: {
          name: body.name,
          mobile: body.mobile,
          password:
            body.password,
          vehicle:
            body.vehicle,
          address:
            body.address,

          photo:
            body.photo,

          aadhaarFront:
            body.aadhaarFront,

          aadhaarBack:
            body.aadhaarBack,

          licenseFile:
            body.licenseFile,

          rcFile:
            body.rcFile,

          approvalStatus:
            "Pending",

          status:
            "Offline",
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Registration Submitted Successfully. Waiting For Admin Approval.",
      rider,
    });
  } catch (error) {
    console.error(
      "DELIVERY REGISTER ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Registration Failed",
      },
      {
        status: 500,
      }
    );
  }
}




