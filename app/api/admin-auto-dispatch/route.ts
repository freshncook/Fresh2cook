import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Rider = {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  approvalStatus: string;
  rating: number;
  completedDeliveries: number;
  lastSeen: Date | null;
};

function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !Number.isInteger(Number(body.orderId)) || Number(body.orderId) <= 0) {
      return NextResponse.json({ error: "Valid orderId is required" }, { status: 400 });
    }

    const orderId = Number(body.orderId);
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const activeAssignment = await prisma.deliveryAssignment.findFirst({
      where: {
        orderId,
        status: { notIn: ["Delivered", "Cancelled", "Rejected", "Failed"] },
      },
    });

    if (activeAssignment) {
      return NextResponse.json(
        { error: "Order already has an active rider assignment", assignment: activeAssignment },
        { status: 409 }
      );
    }

    const suppliedLat = Number(body.latitude);
    const suppliedLon = Number(body.longitude);

    const latitude = Number.isFinite(suppliedLat) ? suppliedLat : order.latitude;
    const longitude = Number.isFinite(suppliedLon) ? suppliedLon : order.longitude;

    if (
      latitude == null ||
      longitude == null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return NextResponse.json(
        { error: "Valid order GPS coordinates are required" },
        { status: 400 }
      );
    }

    const riders: Rider[] = await prisma.deliveryBoy.findMany({
      where: {
        status: "Available",
        approvalStatus: "Approved",
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    if (!riders.length) {
      return NextResponse.json(
        { error: "No approved, available GPS rider found" },
        { status: 400 }
      );
    }

    const ranked = riders
      .filter((rider) =>
        rider.latitude != null &&
        rider.longitude != null &&
        Number.isFinite(rider.latitude) &&
        Number.isFinite(rider.longitude)
      )
      .map((rider) => ({
        rider,
        distance: distance(
          latitude,
          longitude,
          rider.latitude as number,
          rider.longitude as number
        ),
      }))
      .sort((a, b) =>
        a.distance - b.distance ||
        b.rider.rating - a.rider.rating ||
        a.rider.completedDeliveries - b.rider.completedDeliveries
      );

    const selected = ranked[0];

    if (!selected) {
      return NextResponse.json({ error: "No valid GPS rider found" }, { status: 400 });
    }

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId,
        deliveryBoyId: selected.rider.id,
        otp: makeOtp(),
        status: "Pending Acceptance",
      },
    });

    return NextResponse.json({
      success: true,
      assignment,
      rider: {
        id: selected.rider.id,
        name: selected.rider.name,
      },
      distanceKm: Number(selected.distance.toFixed(2)),
    });
  } catch (error) {
    console.error("AUTO DISPATCH ERROR", error);
    return NextResponse.json({ error: "Dispatch failed" }, { status: 500 });
  }
}
