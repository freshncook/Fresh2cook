import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  wall:[
   "Orders Incoming",
   "Dispatch Active",
   "Riders Online",
   "SLA Monitoring",
   "OTP Tracking"
  ]
 });

}





