import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const order = await prisma.order.create({
    data: {
      customer: body.customer,
      amount: Number(body.amount),
      status: "Paid",
    },
  });

  return NextResponse.json(order);
}






