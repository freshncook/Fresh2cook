import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  opportunities:[
   "Launch VIP Membership Push",
   "Increase Referral Campaign",
   "Promote Combo Kits",
   "Recover Abandoned Carts"
  ]
 });

}





