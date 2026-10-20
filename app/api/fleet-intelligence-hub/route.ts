import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  modules:[
   "Forecast",
   "Dispatch",
   "Rewards",
   "Analytics",
   "Control Tower",
   "War Room"
  ]
 });

}





