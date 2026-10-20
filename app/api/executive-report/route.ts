import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  reportDate:new Date(),
  summary:"Business growing steadily",
  recommendation:"Increase repeat orders and referrals"
 });

}





