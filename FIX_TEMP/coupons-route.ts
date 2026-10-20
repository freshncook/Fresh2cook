import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const body = await req.json();

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code,
      discount: Number(body.discount),
      minOrder: Number(body.minOrder || 0),
      active: body.active  true,
      expiryDate: new Date(body.expiryDate),
    },
  });

  return NextResponse.json(coupon);
}






