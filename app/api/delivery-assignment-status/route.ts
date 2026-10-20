import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "Pending Acceptance",
  "Accepted",
  "Picked Up",
  "Out For Delivery",
  "Otp Sent",
  "Delivered",
  "Rejected",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignmentId = Number(body?.assignmentId);
    const status = String(body?.status || "").trim();

    if (!assignmentId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment ID and Status Required",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Delivery Status",
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

    const data: any = { status };

    if (status === "Accepted") {
      data.acceptedAt = new Date();
    }

    if (status === "Picked Up") {
      data.pickedAt = new Date();
    }

    if (status === "Delivered") {
      data.deliveredAt = new Date();
      data.earnings = 25;
    }

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data,
    });

    if (status === "Delivered") {
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
          completedDeliveries: { increment: 1 },
          earnings: { increment: 25 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      assignment: updated,
    });
  } catch (error: any) {
    console.error("ASSIGNMENT STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed To Update Status",
      },
      { status: 500 }
    );
  }
}




