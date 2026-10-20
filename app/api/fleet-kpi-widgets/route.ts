import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  widgets:[
   {
    name:"Online Riders",
    value:"LIVE"
   },
   {
    name:"SLA",
    value:"TRACKING"
   },
   {
    name:"Fleet Health",
    value:"ACTIVE"
   }
  ]
 });

}





