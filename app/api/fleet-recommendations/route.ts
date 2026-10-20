import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    recommendations: [
      "Increase riders in peak hours",
      "Reassign delayed orders",
      "Reward top performers",
      "Monitor low activity zones",
      "Track late deliveries daily",
    ],
  });
}



