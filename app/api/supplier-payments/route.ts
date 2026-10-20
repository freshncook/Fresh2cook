import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data =
    await prisma.supplierPayment.findMany({
      orderBy: { id: "desc" },
    });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const item =
    await prisma.supplierPayment.create({
      data: {
        vendorName: body.vendorName,
        amount: Number(body.amount),
        method: body.method,
        status: body.status || "Paid",
      },
    });

  return NextResponse.json(item);
}






