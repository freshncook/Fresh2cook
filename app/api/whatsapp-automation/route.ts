import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  automations:[
   "Abandoned Cart Recovery",
   "Order Delivered Followup",
   "Refer & Earn Reminder",
   "VIP Renewal Reminder"
  ]
 });

}





