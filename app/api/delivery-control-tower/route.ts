import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "Delivery Control Tower",
    timestamp: new Date().toISOString(),
    metrics: {
      totalOrders: 2540,
      activeOrders: 186,
      deliveredToday: 425,
      deliverySuccessRate: 97.8
    }
  });
}





