import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          earnings: "desc",
        },
      });

    return NextResponse.json(riders);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed To Load Incentives" },
      { status: 500 }
    );
  }
}




