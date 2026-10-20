import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const revenue =
    await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
    });

  const orders =
    await prisma.order.count();

  return NextResponse.json({
    revenue:
      revenue._sum.amount || 0,
    orders,
  });
}






