import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const riders =
    await prisma.deliveryBoy.findMany();

  return NextResponse.json({
    success:true,
    efficiency:riders.map(r=>({
      rider:r.name,
      score:
        (r.completedDeliveries || 0) +
        (r.rating || 0)
    }))
  });

}





