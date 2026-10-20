import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const productivity =
      riders.map((r) => ({
        id: r.id,
        name: r.name,
        deliveries:
          r.completedDeliveries,
        earnings: r.earnings,
      }));

    return NextResponse.json({
      success: true,
      productivity,
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





