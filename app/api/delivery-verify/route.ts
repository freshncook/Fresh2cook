import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignmentId = Number(body.assignmentId);
    const otp = String(body.otp);

    if (!assignmentId || !otp) {
      return NextResponse.json(
        {
          error: "Assignment ID and OTP required",
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
          error: "Assignment not found",
        },
        {
          status: 404,
        }
      );
    }

    if (assignment.otp !== otp) {
      return NextResponse.json(
        {
          error: "Invalid OTP",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP Verified",
    });
  } catch (error) {
    console.error(
      "DELIVERY VERIFY ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Verification Failed",
      },
      {
        status: 500,
      }
    );
  }
}




