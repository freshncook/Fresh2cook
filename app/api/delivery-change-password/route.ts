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

    const oldPassword =
      body.oldPassword;

    const newPassword =
      body.newPassword;

    if (
      !riderId ||
      !oldPassword ||
      !newPassword
    ) {
      return NextResponse.json(
        {
          error:
            "All fields are required",
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
            "Rider not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      rider.password !==
      oldPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Current password is incorrect",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.deliveryBoy.update(
      {
        where: {
          id: riderId,
        },
        data: {
          password:
            newPassword,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to change password",
      },
      {
        status: 500,
      }
    );
  }
}




