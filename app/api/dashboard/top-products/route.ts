import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products =
    await prisma.product.findMany({
      orderBy: {
        stock: "asc",
      },
      take: 10,
    });

  return NextResponse.json(
    products
  );
}






