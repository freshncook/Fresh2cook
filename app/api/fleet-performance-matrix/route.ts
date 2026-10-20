import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const riders =
    await prisma.deliveryBoy.findMany();

  return NextResponse.json({
    success:true,
    matrix:riders.map(r=>({
      id:r.id,
      name:r.name,
      deliveries:r.completedDeliveries,
      earnings:r.earnings,
      rating:r.rating
    }))
  });

}





