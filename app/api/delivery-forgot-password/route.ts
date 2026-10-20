import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const mobile =
      body.mobile?.trim();

    const newPassword =
      body.newPassword?.trim();

    if (
      !mobile ||
      !newPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Mobile and New Password are required",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.findFirst(
        {
          where: {
            mobile,
          },
        }
      );

    if (!rider) {
      return NextResponse.json(
        {
          error:
            "Delivery Partner not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.deliveryBoy.update(
      {
        where: {
          id: rider.id,
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
        "Password Reset Successfully",
    });
  } catch (error) {
    console.error(
      "DELIVERY FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to Reset Password",
      },
      {
        status: 500,
      }
    );
  }
}




