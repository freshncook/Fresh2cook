import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.supportTicket.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.supportTicket.create({
      data: {
        customer: body.customer,
        phone: body.phone,
        issue: body.issue,
        status: body.status || "Open",
      },
    });

  return NextResponse.json(item);
}






