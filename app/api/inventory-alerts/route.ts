import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.inventoryAlert.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.inventoryAlert.create({
      data: {
        productName: body.productName,
        stock: Number(body.stock),
        threshold: Number(body.threshold),
        active: true,
      },
    });

  return NextResponse.json(item);
}






