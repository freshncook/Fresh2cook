import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

/*
 * GET /api/pincode-check?pin=110078
 * Uses Admin > Settings > "Delivery pincodes" and any 6-digit codes written
 * in Delivery Zones (sectors field).
 */
export async function GET(req: Request) {
  const pin = (new URL(req.url).searchParams.get("pin") || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ success: false, error: "Please enter a 6-digit pincode" }, { status: 400 });
  }

  const settings = await getStoreSettings();
  const codes = new Set<string>(settings.servicePincodes.match(/\d{6}/g) || []);

  let zoneName: string | null = null;
  let charge: number | null = null;
  try {
    const zones = await prisma.deliveryZone.findMany({ select: { zoneName: true, sectors: true, charge: true } });
    for (const z of zones) {
      const zoneCodes: string[] = String(z.sectors || "").match(/\d{6}/g) || [];
      zoneCodes.forEach((c) => codes.add(c));
      if (!zoneName && zoneCodes.includes(pin)) {
        zoneName = z.zoneName;
        charge = z.charge;
      }
    }
  } catch {
    /* zones optional */
  }

  if (codes.size === 0) {
    return NextResponse.json({ success: true, configured: false, available: null, pin, supportPhone: settings.supportPhone, serviceArea: settings.serviceAreaName });
  }

  return NextResponse.json({
    success: true,
    configured: true,
    available: codes.has(pin),
    pin,
    zone: zoneName,
    zoneCharge: charge,
    freeDeliveryTarget: settings.freeDeliveryTarget,
    deliveryCharge: settings.deliveryCharge,
    supportPhone: settings.supportPhone,
    serviceArea: settings.serviceAreaName,
  });
}
