import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = Number(body?.orderId);
    const assignmentId = body?.assignmentId
      ? Number(body.assignmentId)
      : null;

    const assignment = assignmentId
      ? await prisma.deliveryAssignment.findUnique({
          where: { id: assignmentId },
        })
      : await prisma.deliveryAssignment.findFirst({
          where: { orderId },
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
          error: "OTP can be generated only when rider is delivering",
        },
        { status: 400 }
      );
    }

    const otp = generateOTP();

    await prisma.deliveryAssignment.update({
      where: { id: assignment.id },
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
      message: "New OTP generated for customer",
      customerNotification: {
        customer: order?.customer || "",
        phone: order?.phone || "",
        message: `Fresh2Cook Delivery OTP: ${otp}. Please share this OTP with the rider after receiving your order.`,
      },
    });
  } catch (error: any) {
    console.error("DELIVERY OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed To Generate OTP",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const orderId = Number(body?.orderId);
    const otp = String(body?.otp || "").trim();

    if (!orderId || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID And OTP Required",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { orderId },
    });

    if (!assignment || assignment.otp !== otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP Verified Successfully",
    });
  } catch (error: any) {
    console.error("OTP VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "OTP Verification Failed",
      },
      { status: 500 }
    );
  }
}




