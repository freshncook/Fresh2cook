import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "AI Demand Forecast",
    timestamp: new Date().toISOString()
  });
}





