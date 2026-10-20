import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Admin Delivery Alerts",
    alerts: [
      {
        id: 1,
        type: "Late Delivery",
        severity: "High",
        message: "12 orders delayed"
      },
      {
        id: 2,
        type: "Rider Shortage",
        severity: "Medium",
        message: "Zone A requires 3 riders"
      }
    ],
    timestamp: new Date().toISOString()
  });
}




