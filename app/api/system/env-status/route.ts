import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,

  razorpay:
   !!process.env.RAZORPAY_KEY_ID,

  whatsapp:
   !!process.env.WHATSAPP_TOKEN,

  maps:
   !!process.env.GOOGLE_MAPS_API_KEY,

  firebase:
   !!process.env.FIREBASE_PROJECT_ID,

  supabase:
   !!process.env.NEXT_PUBLIC_SUPABASE_URL
 });

}





