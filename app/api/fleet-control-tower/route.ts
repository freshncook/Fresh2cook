import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    towerStatus: "ACTIVE",
    modules: [
      "Forecast AI",
      "Dispatch AI",
      "Fleet Intelligence",
      "Zone Optimizer",
      "Executive Analytics",
      "Control Tower"
    ]
  });
}





