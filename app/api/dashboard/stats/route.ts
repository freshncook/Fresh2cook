import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads =
    await prisma.lead.count();

  const orders =
    await prisma.order.count();

  const products =
    await prisma.product.count();

  const tasks =
    await prisma.task.count();

  const wallet =
    await prisma.walletTransaction.aggregate({
      _sum: {
        credit: true,
      },
    });

  const revenue =
    await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
    });

  return NextResponse.json({
    leads,
    orders,
    products,
    tasks,
    revenue:
      revenue._sum.amount || 0,
    wallet:
      wallet._sum.credit || 0,
  });
}






