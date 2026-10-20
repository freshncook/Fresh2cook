import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const assignmentId =
      Number(body.assignmentId);

    const otp =
      String(body.otp || "").trim();

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assignment ID required",
        },
        {
          status: 400,
        }
      );
    }

    const assignment =
      await prisma.deliveryAssignment.findUnique({
        where: {
          id: assignmentId,
        },
      });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assignment not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      assignment.otp !== otp
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid OTP",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.deliveryAssignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        status: "Delivered",
        deliveredAt:
          new Date(),
      },
    });

    await prisma.order.update({
      where: {
        id: assignment.orderId,
      },
      data: {
        status:
          "Delivered",
      },
    });

    await prisma.deliveryBoy.update({
      where: {
        id:
          assignment.deliveryBoyId,
      },
      data: {
        completedDeliveries: {
          increment: 1,
        },
        earnings: {
          increment:
            assignment.earnings,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Delivery completed successfully",
    });
  } catch (error: any) {
    console.error(
      "COMPLETE DELIVERY ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}





