import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  walletBalance:2450,
  todayEarning:350,
  weekEarning:1850
 });

}





