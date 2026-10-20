import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "AI Sales Coach",
    timestamp: new Date().toISOString()
  });
}





