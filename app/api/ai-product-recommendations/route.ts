import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "AI Product Recommendations",
    timestamp: new Date().toISOString()
  });
}





