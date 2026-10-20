import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vendors = await prisma.vendor.count();

  const orders = await prisma.vendorOrder.count();

  const amount =
    await prisma.vendorOrder.aggregate({
      _sum: {
        amount: true,
      },
    });

  return NextResponse.json({
    vendors,
    orders,
    amount: amount._sum.amount || 0,
  });
}






