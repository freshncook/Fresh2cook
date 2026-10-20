import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.customerSegment.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.customerSegment.create({
    data: {
      name: body.name,
      description: body.description || "",
    },
  });

  return NextResponse.json(item);
}






