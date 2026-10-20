import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Socket Authentication",
    timestamp: new Date().toISOString()
  });
}





