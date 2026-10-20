import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.membership.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.membership.create({
    data: {
      customer: body.customer,
      phone: body.phone,
      plan: body.plan,
      amount: Number(body.amount),
      active: true,
    },
  });

  return NextResponse.json(item);
}






