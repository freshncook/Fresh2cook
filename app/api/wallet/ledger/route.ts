import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  ledger:[
   {
    type:"Referral",
    amount:20,
    balance:120,
    createdAt:new Date()
   },
   {
    type:"Cashback",
    amount:15,
    balance:100,
    createdAt:new Date()
   }
  ]
 });

}





