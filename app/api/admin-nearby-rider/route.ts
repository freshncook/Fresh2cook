import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const latitude = Number(
      searchParams.get("latitude")
    );

    const longitude = Number(
      searchParams.get("longitude")
    );

    const riders =
      await prisma.deliveryBoy.findMany({
        where: {
          status: "Available",
        },
      });

    const nearby = riders
      .filter(
        (r: any) =>
          r.latitude != null &&
          r.longitude != null
      )
      .map((rider: any) => ({
        ...rider,
        distance:
          calculateDistance(
            latitude,
            longitude,
            rider.latitude,
            rider.longitude
          ),
      }))
      .sort(
        (a: any, b: any) =>
          a.distance - b.distance
      );

    return NextResponse.json(
      nearby
    );
  } catch (error) {
    console.error(
      "NEARBY RIDER ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Riders",
      },
      {
        status: 500,
      }
    );
  }
}




