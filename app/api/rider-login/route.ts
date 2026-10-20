
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function sign(payload: string) {
  const secret = process.env.RIDER_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("RIDER_SESSION_SECRET must be at least 32 characters");
  }

  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mobile = String(body.mobile ?? "").trim();
    const password = String(body.password ?? "");

    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, error: "Mobile and password required" },
        { status: 400 }
      );
    }

    const rider = await prisma.deliveryBoy.findUnique({
      where: { mobile },
    });

    if (!rider || !rider.password || rider.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile or password" },
        { status: 401 }
      );
    }

    if (rider.approvalStatus !== "Approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Your rider account is not approved yet",
          approvalStatus: rider.approvalStatus,
        },
        { status: 403 }
      );
    }

    const payload = Buffer.from(
      JSON.stringify({
        riderId: rider.id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    ).toString("base64url");

    const token = `${payload}.${sign(payload)}`;

    const response = NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        name: rider.name,
        mobile: rider.mobile,
        vehicle: rider.vehicle,
        status: rider.status,
        approvalStatus: rider.approvalStatus,
      },
    });

    response.cookies.set("f2c_rider_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("RIDER LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Login failed. Check server configuration." },
      { status: 500 }
    );
  }
}
