import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.customerPrediction.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.customerPrediction.create({
    data: {
      customer: body.customer,
      prediction: body.prediction,
      confidence: Number(body.confidence || 80),
    },
  });

  return NextResponse.json(item);
}






