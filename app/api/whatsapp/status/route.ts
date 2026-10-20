import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  provider:"WhatsApp",
  configured:!!process.env.WHATSAPP_TOKEN
 });

}





