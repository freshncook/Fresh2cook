import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignmentId =
      Number(body.assignmentId);

    const assignment =
      await prisma.deliveryAssignment.update({
        where: {
          id: assignmentId,
        },
        data: {
          status: "Picked Up",
          pickedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Pickup Failed",
      },
      {
        status: 500,
      }
    );
  }
}




