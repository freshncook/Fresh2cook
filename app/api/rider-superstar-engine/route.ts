import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rider =
      await prisma.deliveryBoy.findFirst({
        orderBy: [
          {
            completedDeliveries: "desc",
          },
          {
            rating: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      superstar: rider,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Superstar Engine Failed",
      },
      { status: 500 }
    );
  }
}




