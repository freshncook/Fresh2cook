import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  trend:[
   {month:"Jan",value:120000},
   {month:"Feb",value:135000},
   {month:"Mar",value:142000},
   {month:"Apr",value:158000}
  ]
 });

}





