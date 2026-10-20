import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Rider Command Center",
    timestamp: new Date().toISOString(),
    data: {
      totalRiders: 125,
      activeRiders: 98,
      completedDeliveries: 4567
    }
  });
}





