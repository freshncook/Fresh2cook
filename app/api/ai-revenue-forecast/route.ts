import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "AI Revenue Forecast",
    timestamp: new Date().toISOString()
  });
}





