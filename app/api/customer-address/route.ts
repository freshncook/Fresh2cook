import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const addresses =
    await prisma.customerAddress.findMany({
      orderBy: {
        id: "desc",
      },
    });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const body = await req.json();

  const address =
    await prisma.customerAddress.create({
      data: {
        customer: body.customer,
        phone: body.phone,
        address: body.address,
        city: body.city || "",
        pincode: body.pincode || "",
      },
    });

  return NextResponse.json(address);
}






