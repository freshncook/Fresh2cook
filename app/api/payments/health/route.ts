import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  paymentGateway:"Razorpay",
  status:"Ready",
  timestamp:new Date()
 });

}





