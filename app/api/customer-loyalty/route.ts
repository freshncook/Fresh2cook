import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  loyaltyPoints:1250,
  loyaltyTier:"Gold",
  nextRewardAt:1500
 });

}





