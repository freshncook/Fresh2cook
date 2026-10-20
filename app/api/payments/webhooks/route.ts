import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Payment Webhooks",
    timestamp: new Date().toISOString()
  });
}





