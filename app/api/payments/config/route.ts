import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  razorpayConfigured:
   !!process.env.RAZORPAY_KEY_ID,
  razorpaySecretConfigured:
   !!process.env.RAZORPAY_KEY_SECRET
 });

}





