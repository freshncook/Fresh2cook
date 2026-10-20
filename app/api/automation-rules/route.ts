import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.automationRule.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.automationRule.create({
    data: {
      name: body.name,
      trigger: body.trigger,
      action: body.action,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(item);
}






