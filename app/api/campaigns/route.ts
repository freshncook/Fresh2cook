import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.campaign.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.campaign.create({
    data: {
      title: body.title,
      channel: body.channel,
      audience: body.audience,
      status: body.status || "Draft",
    },
  });

  return NextResponse.json(item);
}






