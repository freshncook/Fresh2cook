import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mobile = String(body.mobile ?? "").trim();

    if (!/^[0-9+\-\s()]{8,20}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "Enter a valid registered mobile number." }, { status: 400 });
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!sid || !token || !from) {
      return NextResponse.json({
        success: false,
        error: "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER in .env, then restart the server."
      }, { status: 503 });
    }

    const rider = await prisma.deliveryBoy.findUnique({ where: { mobile } });

    if (!rider) {
      return NextResponse.json({ success: false, error: "No rider account found for this mobile number." }, { status: 404 });
    }

    const temporaryPassword = randomBytes(6).toString("hex");
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const payload = new URLSearchParams({
      To: mobile,
      From: from,
      Body: `Fresh2Cook Rider: Your temporary password is ${temporaryPassword}. Login and change it immediately. If you did not request this, contact support.`
    });

    const sms = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString(),
      cache: "no-store"
    });

    if (!sms.ok) {
      console.error("RIDER PASSWORD SMS FAILED:", await sms.text());
      return NextResponse.json({ success: false, error: "SMS could not be sent. Check your SMS provider settings and registered sender number." }, { status: 502 });
    }

    await prisma.deliveryBoy.update({
      where: { id: rider.id },
      data: { password: temporaryPassword }
    });

    return NextResponse.json({
      success: true,
      message: "Temporary password sent by SMS. Please log in and change it as soon as possible."
    });
  } catch (error) {
    console.error("RIDER FORGOT PASSWORD ERROR:", error);
    return NextResponse.json({ success: false, error: "Password reset failed. Please try again." }, { status: 500 });
  }
}
