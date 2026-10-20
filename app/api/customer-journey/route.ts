import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.customerJourney.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.customerJourney.create({
    data: {
      customer: body.customer,
      stage: body.stage,
      status: body.status || "Active",
    },
  });

  return NextResponse.json(item);
}






