import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  rewards:[
   {
    title:"Free Delivery Coupon",
    points:500
   },
   {
    title:"?100 Cashback",
    points:1000
   },
   {
    title:"VIP Upgrade",
    points:2000
   }
  ]
 });

}





