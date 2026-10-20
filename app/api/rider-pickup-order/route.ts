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

    if (assignment.status !== "Accepted") {
      return NextResponse.json(
        {
          success: false,
          error: "Order must be Accepted before Pickup",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "Picked Up",
        pickedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: assignment.orderId },
      data: { status: "Picked Up" },
    });

    return NextResponse.json({
      success: true,
      assignment: updated,
      message: "Order Picked Up Successfully",
    });
  } catch (error: any) {
    console.error("RIDER PICKUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed To Pickup Order",
      },
      { status: 500 }
    );
  }
}




