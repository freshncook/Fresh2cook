import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const product =
      await prisma.product.create({
  data: {
    name: body.name,
    category:
      body.category ||
      "Vegetables",
    price: Number(
      body.price
    ),
    pack: body.pack,
    stock: Number(
      body.stock
    ),
    image: body.image,
  },
});

    return NextResponse.json(
      product
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Create Failed",
      },
      {
        status: 500,
      }
    );
  }
}






