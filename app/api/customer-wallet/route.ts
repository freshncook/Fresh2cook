import { NextResponse } from "next/server";

export async function GET(){
 return NextResponse.json({
  success:true,
  walletBalance:120,
  cashbackEarned:80,
  referralEarned:40
 });
}





