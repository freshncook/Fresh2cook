import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.campaignLog.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.campaignLog.create({
    data: {
      campaignId: Number(body.campaignId),
      customer: body.customer,
      status: body.status || "Sent",
    },
  });

  return NextResponse.json(item);
}






