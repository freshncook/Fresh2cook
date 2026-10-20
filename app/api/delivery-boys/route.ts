import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders = await prisma.deliveryBoy.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      riders,
    });
  } catch (error: any) {
    console.error("GET RIDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed To Load Riders",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const mobile = String(body.mobile || "").trim();
    const vehicle = String(body.vehicle || "").trim();

    if (!name || !mobile || !vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, mobile and vehicle are required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryBoy.findUnique({
      where: {
        mobile,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "This mobile number is already registered",
        },
        { status: 409 }
      );
    }

    const rider = await prisma.deliveryBoy.create({
      data: {
        name,
        mobile,
        vehicle,
        status: "Available",
        approvalStatus: "Approved",
      },
    });

    return NextResponse.json({
      success: true,
      rider,
    });
  } catch (error: any) {
    console.error("CREATE RIDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed To Create Delivery Boy",
      },
      { status: 500 }
    );
  }
}




