import { NextResponse } from "next/server";

export async function POST() {
  const otp = Math.floor(
    1000 + Math.random() * 9000
  );

  return NextResponse.json({
    success: true,
    otp
  });
}


