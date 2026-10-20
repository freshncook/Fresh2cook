import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  gateway:"Razorpay",
  configured:!!process.env.RAZORPAY_KEY_ID
 });

}





