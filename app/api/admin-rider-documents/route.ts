import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        select: {
          id: true,
          name: true,
          mobile: true,
          vehicle: true,
          photo: true,
          aadhaarFront: true,
          aadhaarBack: true,
          licenseFile: true,
          rcFile: true,
          approvalStatus: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      riders
    );
  } catch (error) {
    console.error(
      "RIDER DOCUMENTS ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Documents",
      },
      {
        status: 500,
      }
    );
  }
}




