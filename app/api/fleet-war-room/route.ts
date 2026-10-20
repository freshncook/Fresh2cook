import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  alerts:[
   "High demand zone detected",
   "Monitor SLA performance",
   "Review idle riders",
   "Check reassignment queue"
  ]
 });

}





