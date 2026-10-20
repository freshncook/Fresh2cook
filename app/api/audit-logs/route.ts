import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  logs:[
   "Admin Login",
   "Order Updated",
   "Wallet Credited",
   "Referral Applied"
  ]
 });

}





