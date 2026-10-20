import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: [
            "Delivered",
            "Cancelled",
            "Assigned To Rider",
            "Assigned",
          ],
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          id: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      orders,
      riders,
    });
  } catch (error: any) {
    console.error(
      "ADMIN ASSIGN GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed To Load Data",
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
    const body = await req.json();

    const orderId = Number(
      body?.orderId
    );

    const riderId = Number(
      body?.riderId
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid Order ID required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(riderId) ||
      riderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid Rider ID required",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.findUnique({
        where: {
          id: riderId,
        },
      });

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          error: "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      await prisma.deliveryAssignment.findFirst(
        {
          where: {
            orderId,
          },
        }
      );

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Order Already Assigned",
        },
        {
          status: 409,
        }
      );
    }

    const assignment =
      await prisma.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId:
            riderId,

          /*
           * OTP is NOT generated at assignment.
           * It will be generated only at delivery.
           */
          otp: "",

          status:
            "Pending Acceptance",

          assignedAt:
            new Date(),

          pickupDeadline:
            new Date(
              Date.now() +
                3 * 60 * 1000
            ),

          earnings: 25,
        },
      });

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status:
          "Assigned To Rider",

        deliveryOtp: null,
      },
    });

    return NextResponse.json({
      success: true,
      assignment,
      message:
        "Order assigned to rider. Delivery OTP will be generated only at delivery.",
    });
  } catch (error: any) {
    console.error(
      "ADMIN ASSIGN POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}




