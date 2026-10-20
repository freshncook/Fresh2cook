export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const body = await req.json();

  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      phone: body.phone,
      area: body.area,
      source: body.source,
      interest: body.interest,
      status: body.status || "New",
      value: Number(body.value || 0),
      nextFollowUp: body.nextFollowUp || "",
      avatar: body.avatar || "NA",
    },
  });

  return NextResponse.json(lead);
}






