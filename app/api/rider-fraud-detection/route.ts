import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const riders = await prisma.deliveryBoy.findMany();

  const alerts = riders.filter(
    (r) =>
      r.completedDeliveries > 0 &&
      r.rating < 2.5
  );

  return NextResponse.json({
    success: true,
    suspiciousRiders: alerts,
    totalAlerts: alerts.length,
  });
}




