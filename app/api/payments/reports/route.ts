import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Payment Reports",
    timestamp: new Date().toISOString()
  });
}





