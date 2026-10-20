import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.purchaseOrder.findMany({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item = await prisma.purchaseOrder.create({
    data: {
      vendorId: Number(body.vendorId),
      vendorName: body.vendorName,
      amount: Number(body.amount),
      status: body.status || "Pending",
    },
  });

  return NextResponse.json(item);
}






