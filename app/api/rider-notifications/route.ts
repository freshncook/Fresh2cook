import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  notifications:[
   {
    title:"New Delivery Assigned"
   },
   {
    title:"Pickup Pending"
   }
  ]
 });

}





