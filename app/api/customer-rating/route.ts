import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const assignment =
      await prisma.deliveryAssignment.update({
        where: {
          id: Number(body.assignmentId),
        },
        data: {
          customerRating: Number(body.rating),
        },
      });

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Rating Failed" },
      { status: 500 }
    );
  }
}




