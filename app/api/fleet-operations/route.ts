import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "Operational",
    systems: [
      "Fleet AI",
      "Dispatch Engine",
      "Risk Engine",
      "Prediction Engine",
      "Command Center",
    ],
  });
}





