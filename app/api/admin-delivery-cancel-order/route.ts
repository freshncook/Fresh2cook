import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Admin Delivery Cancel Order",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Order cancelled successfully",
    timestamp: new Date().toISOString(),
  });
}




