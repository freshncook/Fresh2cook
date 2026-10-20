import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.loyaltyTier.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.loyaltyTier.create({
      data: {
        tierName: body.tierName,
        minSpend: Number(body.minSpend),
        benefits: body.benefits,
      },
    });

  return NextResponse.json(item);
}






