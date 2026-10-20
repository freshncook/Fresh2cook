import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOtp() {
  return Math.floor(
    1000 + Math.random() * 9000
  ).toString();
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const orderId = Number(
      body.orderId
    );

    const riderId = Number(
      body.riderId
    );

    if (
      !orderId ||
      !riderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order and Rider required",
        },
        { status: 400 }
      );
    }

    const otp =
      generateOtp();

    const assignment =
      await prisma.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId:
            riderId,
          otp,
          status:
            "Pending Acceptance",
        },
      });

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        deliveryOtp:
          otp,
        status:
          "Assigned To Rider",
      },
    });

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Assignment failed",
      },
      { status: 500 }
    );
  }
}




