import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const rider =
      await prisma.deliveryBoy.findFirst({
        where: {
          mobile:
            body.mobile,
        },
      });

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mobile number not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      rider.approvalStatus !==
      "Approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is pending admin approval",
        },
        {
          status: 403,
        }
      );
    }

    if (
      rider.password !==
      body.password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    await prisma.deliveryBoy.update({
      where: {
        id: rider.id,
      },
      data: {
        status: "Online",
        lastSeen:
          new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        name: rider.name,
        mobile:
          rider.mobile,
        vehicle:
          rider.vehicle,
        photo:
          rider.photo,
        rating:
          rider.rating,
        completedDeliveries:
          rider.completedDeliveries,
        earnings:
          rider.earnings,
      },
    });
  } catch (error) {
    console.error(
      "DELIVERY LOGIN ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}




