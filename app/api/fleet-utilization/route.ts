import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const data =
      riders.map((r) => ({
        id:r.id,
        name:r.name,
        deliveries:
          r.completedDeliveries,
        utilization:
          Math.min(
            100,
            r.completedDeliveries
          ),
      }));

    return NextResponse.json({
      success:true,
      riders:data,
    });
  } catch (error:any) {
    return NextResponse.json(
      {
        success:false,
        error:error?.message
      },
      { status:500 }
    );
  }
}





