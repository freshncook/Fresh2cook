import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  campaigns:[
   "Win Back Customers",
   "VIP Loyalty Drive",
   "Weekend Combo Offer",
   "Refer & Earn Booster"
  ]
 });

}





