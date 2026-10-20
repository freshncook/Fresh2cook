import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  incentives:[
   {
    title:"100 Deliveries Bonus",
    amount:500
   },
   {
    title:"Top Performer",
    amount:1000
   }
  ]
 });

}





