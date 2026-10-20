import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  penalties:[
   {
    reason:"Late Delivery",
    amount:50
   },
   {
    reason:"No Show",
    amount:100
   }
  ]
 });

}





