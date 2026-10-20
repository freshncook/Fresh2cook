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
        { success: false, error: "Assignment Not Found" },
        { status: 404 }
      );
    }

    if (assignment.status !== "Otp Sent") {
      return NextResponse.json(
        {
          success: false,
          error: "OTP is not active for this delivery",
        },
        { status: 400 }
      );
    }

    if (assignment.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "Delivered",
        deliveredAt: new Date(),
        earnings: 25,
      },
    });

    await prisma.order.update({
      where: { id: assignment.orderId },
      data: {
        status: "Delivered",
        deliveryOtp: null,
      },
    });

    await prisma.deliveryBoy.update({
      where: { id: assignment.deliveryBoyId },
      data: {
        status: "Available",
        completedDeliveries: {
          increment: 1,
        },
        earnings: {
          increment: 25,
        },
      },
    });

    return NextResponse.json({
      success: true,
      delivered: true,
      earning: 25,
      assignment: updated,
      message: "Delivery Completed Successfully",
    });
  } catch (error: any) {
    console.error("RIDER COMPLETE DELIVERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Delivery Failed",
      },
      { status: 500 }
    );
  }
}




