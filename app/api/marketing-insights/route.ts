import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.marketingInsight.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.marketingInsight.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || "Medium",
    },
  });

  return NextResponse.json(item);
}






