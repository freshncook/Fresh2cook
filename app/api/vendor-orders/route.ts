import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.vendorOrder.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const order = await prisma.vendorOrder.create({
    data: {
      vendorId: Number(body.vendorId),
      product: body.product,
      quantity: Number(body.quantity),
      amount: Number(body.amount),
      status: body.status || "Pending",
    },
  });

  return NextResponse.json(order);
}






