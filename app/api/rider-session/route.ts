
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function validSignature(payload: string, signature: string) {
  const secret = process.env.RIDER_SESSION_SECRET;
  if (!secret || secret.length < 32) return false;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest();

  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }

  return supplied.length === expected.length &&
    timingSafeEqual(supplied, expected);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("f2c_rider_session")?.value;

  if (!token) {
    return NextResponse.json({ success: false, session: false }, { status: 401 });
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2 || !validSignature(parts[0], parts[1])) {
      throw new Error("Invalid session");
    }

    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    );

    if (
      !Number.isInteger(payload.riderId) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now()
    ) {
      throw new Error("Expired session");
    }

    return NextResponse.json({
      success: true,
      session: true,
      riderId: payload.riderId,
    });
  } catch {
    const response = NextResponse.json(
      { success: false, session: false },
      { status: 401 }
    );

    response.cookies.set("f2c_rider_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}
