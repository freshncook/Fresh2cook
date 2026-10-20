import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Audit Logs",
    timestamp: new Date().toISOString()
  });
}





