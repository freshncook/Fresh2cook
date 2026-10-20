import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    trends: {
      deliveriesGrowth: 12,
      riderGrowth: 8,
      revenueGrowth: 15,
      slaImprovement: 5,
    },
  });
}





