import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Register API",
    timestamp: new Date().toISOString()
  });
}





