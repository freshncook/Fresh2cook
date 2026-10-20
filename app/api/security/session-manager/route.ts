import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Session Manager",
    timestamp: new Date().toISOString()
  });
}





