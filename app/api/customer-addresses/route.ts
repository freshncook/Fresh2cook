import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callerOf, ownsAssignment, ownsOrder } from "@/lib/caller";

export async function GET(
  request: NextRequest
) {
  try {
    const phone =
      request.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json([]);
    }

    const addresses =
      await prisma.customerAddress.findMany({
        where: { phone },
        orderBy: [
          { isDefault: "desc" },
          { id: "desc" },
        ],
      });

    return NextResponse.json(addresses);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();
    const who = callerOf(request);
    if (who.kind === "customer") body.phone = who.mobile; // customers save only their own addresses

    const {
      customer,
      phone,
      label,
      address,
      city,
      pincode,
      isDefault,
    } = body;

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { phone },
        data: {
          isDefault: false,
        },
      });
    }

    const item =
      await prisma.customerAddress.create({
        data: {
          customer,
          phone,
          label: label || "Home",
          address,
          city,
          pincode,
          isDefault: Boolean(isDefault),
        },
      });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed",
      },
      {
        status: 500,
      }
    );
  }
}


