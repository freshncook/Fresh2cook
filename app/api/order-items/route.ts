import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.orderItem.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.orderItem.create({
    data: {
      orderId: Number(body.orderId),
      productId: Number(body.productId),
      productName: body.productName,
      quantity: Number(body.quantity),
      price: Number(body.price),
      total:
        Number(body.quantity) *
        Number(body.price),
    },
  });

  return NextResponse.json(item);
}






