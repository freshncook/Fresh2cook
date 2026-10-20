import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cart = await prisma.cart.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.cart.create({
    data: {
      customer: "Guest",
      phone: "9999999999",
      amount: Number(body.amount),
      status: "Cart",
    },
  });

  return NextResponse.json(item);
}






