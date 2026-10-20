import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Razorpay Create Order",
    timestamp: new Date().toISOString()
  });
}





