import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.churnRisk.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.churnRisk.create({
    data: {
      customer: body.customer,
      riskLevel: body.riskLevel || "Medium",
      score: Number(body.score || 50),
    },
  });

  return NextResponse.json(item);
}






