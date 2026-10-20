import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    modules: [
      "Dispatch Engine",
      "Risk Engine",
      "SLA Monitor",
      "Revenue Tracker",
      "Fleet Intelligence",
      "Zone Optimizer",
      "Executive Analytics"
    ],
    status: "ACTIVE"
  });
}





