import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "AI Customer Churn",
    timestamp: new Date().toISOString()
  });
}





