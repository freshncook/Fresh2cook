import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  transactions:[
   {
    type:"Cashback",
    amount:20,
    createdAt:new Date()
   },
   {
    type:"Referral",
    amount:20,
    createdAt:new Date()
   }
  ]
 });

}





