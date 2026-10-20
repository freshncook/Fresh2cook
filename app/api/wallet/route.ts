import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.walletTransaction.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.walletTransaction.create({
      data: {
        customer: body.customer,
        phone: body.phone,
        credit: Number(body.credit),
        type: body.type,
        expiresAt: new Date(body.expiresAt),
      },
    });

  return NextResponse.json(item);
}






