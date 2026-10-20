import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Login API",
    timestamp: new Date().toISOString()
  });
}





