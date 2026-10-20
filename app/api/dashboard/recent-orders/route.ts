import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders =
    await prisma.order.findMany({
      orderBy: {
        id: "desc",
      },
      take: 10,
    });

  return NextResponse.json(
    orders
  );
}






