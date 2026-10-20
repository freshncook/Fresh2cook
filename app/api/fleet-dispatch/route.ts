import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        where: {
          status: "Online",
        },
        orderBy: {
          completedDeliveries: "desc",
        },
        take: 5,
      });

    return NextResponse.json({
      success: true,
      dispatchCandidates: riders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message,
      },
      { status: 500 }
    );
  }
}





