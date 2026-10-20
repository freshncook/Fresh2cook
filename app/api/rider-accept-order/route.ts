import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assignmentId = Number(body?.assignmentId);

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID required" },
        { status: 400 }
      );
    }

    const token = req.cookies.get("f2c_rider_session")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Please log in again" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Use POST /api/delivery-accept with assignmentId and action: accept or reject.",
      },
      { status: 410 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
