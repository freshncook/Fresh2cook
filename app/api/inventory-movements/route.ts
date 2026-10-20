import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.inventoryMovement.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.inventoryMovement.create({
      data: {
        productName: body.productName,
        quantity: Number(body.quantity),
        movement: body.movement,
      },
    });

  return NextResponse.json(item);
}






