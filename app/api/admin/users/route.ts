import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "User Management",
    timestamp: new Date().toISOString()
  });
}





