import { NextResponse } from "next/server";

export async function GET(){
 return NextResponse.json({
  success:true,
  referralCode:"FRESH20",
  referralReward:20
 });
}





