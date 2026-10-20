import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.campaignTrigger.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.campaignTrigger.create({
    data: {
      triggerName: body.triggerName,
      condition: body.condition,
      action: body.action,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(item);
}






