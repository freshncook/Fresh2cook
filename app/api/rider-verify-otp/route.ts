import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callerOf, ownsAssignment, ownsOrder } from "@/lib/caller";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const assignmentId = Number(body?.assignmentId);
    const otp = String(body?.otp || "").trim();

    if (!assignmentId || !otp) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Assignment ID and OTP Required",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (assignment && !ownsAssignment(request, assignment.deliveryBoyId)) {
      return NextResponse.json({ success: false, error: "Assignment Not Found" }, { status: 404 });
    }

    if (!assignment) {
      return NextResponse.json(
        { success: false, verified: false, error: "Assignment Not Found" },
        { status: 404 }
      );
    }

    if (assignment.status !== "Otp Sent") {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Please send delivery OTP first",
        },
        { status: 400 }
      );
    }

    const verified = assignment.otp === otp;

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      assignmentId,
      message: "OTP Verified Successfully",
    });
  } catch (error: any) {
    console.error("RIDER VERIFY OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: error?.message || "OTP Verification Failed",
      },
      { status: 500 }
    );
  }
}




