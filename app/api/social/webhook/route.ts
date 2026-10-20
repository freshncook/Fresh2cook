import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token &&
    verifyToken &&
    token === verifyToken
  ) {
    return new Response(challenge || "", {
      status: 200,
    });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "WhatsApp webhook:",
      JSON.stringify(body, null, 2)
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}






