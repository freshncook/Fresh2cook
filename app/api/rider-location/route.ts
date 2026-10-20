import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations =
      await prisma.riderLocationHistory.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Location fetch failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const location =
      await prisma.riderLocationHistory.create({
        data: {
          riderId: body.riderId,
          latitude: body.latitude,
          longitude: body.longitude,
          speed: body.speed || 0,
        },
      });

    return NextResponse.json({
      success: true,
      location,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Location update failed",
      },
      { status: 500 }
    );
  }
}




