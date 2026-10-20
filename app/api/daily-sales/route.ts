import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.dailySale.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.dailySale.create({
      data: {
        saleDate: body.saleDate,
        orders: Number(body.orders),
        revenue: Number(body.revenue),
      },
    });

  return NextResponse.json(item);
}






