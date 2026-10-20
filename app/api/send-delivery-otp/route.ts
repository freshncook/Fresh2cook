import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignmentId = Number(body?.assignmentId);

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID Required" },
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

    if (!["Picked Up", "Out For Delivery", "Otp Sent"].includes(assignment.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rider must be in delivery stage",
        },
        { status: 400 }
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        otp,
        status: "Otp Sent",
      },
    });

    await prisma.order.update({
      where: { id: assignment.orderId },
      data: {
        deliveryOtp: otp,
        status: "Out For Delivery",
      },
    });

    const order = await prisma.order.findUnique({
      where: { id: assignment.orderId },
    });

    return NextResponse.json({
      success: true,
      customer: order?.customer || "",
      phone: order?.phone || "",
      customerNotification: {
        customer: order?.customer || "",
        phone: order?.phone || "",
        message: `Fresh2Cook Delivery OTP: ${otp}. Please share this OTP with the rider after receiving your order.`,
      },
      message: "New OTP generated and ready for customer notification",
    });
  } catch (error: any) {
    console.error("SEND DELIVERY OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed To Generate Delivery OTP",
      },
      { status: 500 }
    );
  }
}




