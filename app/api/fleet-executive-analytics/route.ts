import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      riders,
      assignments,
      orders,
    ] = await Promise.all([
      prisma.deliveryBoy.count(),
      prisma.deliveryAssignment.count(),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      success: true,
      riders,
      assignments,
      orders,
      generatedAt: new Date(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}





