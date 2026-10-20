import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  modules:[
   "Joining Training",
   "Delivery SOP",
   "Customer Handling",
   "Cash Collection",
   "OTP Delivery"
  ]
 });

}





