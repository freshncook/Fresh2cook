import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      success: true,
      message: `Status Updated: ${body.status}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed To Send Status" },
      { status: 500 }
    );
  }
}




