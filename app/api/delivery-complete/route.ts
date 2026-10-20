import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignmentId = Number(body?.assignmentId);
    const otp = String(body?.otp || "").trim();

    if (!assignmentId || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment ID And OTP Required",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
    });

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
          error: "Delivery OTP is not active",
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

    await prisma.deliveryAssignment.update({
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
        completedDeliveries: { increment: 1 },
        earnings: { increment: 25 },
        status: "Available",
      },
    });

    return NextResponse.json({
      success: true,
      earning: 25,
      message: "Delivery Completed Successfully",
    });
  } catch (error: any) {
    console.error("DELIVERY COMPLETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Delivery Failed",
      },
      { status: 500 }
    );
  }
}




