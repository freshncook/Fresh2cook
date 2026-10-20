import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          status: true,
        },
      });

    return NextResponse.json({
      success: true,
      riders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message,
      },
      { status: 500 }
    );
  }
}



