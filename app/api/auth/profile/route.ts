import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Profile API",
    timestamp: new Date().toISOString()
  });
}





