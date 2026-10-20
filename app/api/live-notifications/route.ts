import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Live Notifications",
    timestamp: new Date().toISOString()
  });
}





