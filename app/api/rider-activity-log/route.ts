import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  logs:[
   {
    action:"Accepted Order",
    time:new Date()
   },
   {
    action:"Picked Up Order",
    time:new Date()
   }
  ]
 });

}





