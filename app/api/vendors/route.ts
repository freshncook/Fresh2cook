import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const body = await req.json();

  const vendor = await prisma.vendor.create({
    data: {
      name: body.name,
      phone: body.phone,
      category: body.category,
      city: body.city,
    },
  });

  return NextResponse.json(vendor);
}






