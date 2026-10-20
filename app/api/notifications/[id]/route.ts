import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  notifications:[
   "New Order",
   "Payment Received",
   "Referral Reward",
   "Delivery Assigned"
  ]
 });

}



