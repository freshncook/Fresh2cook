import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  insight:"Revenue growth is positive. Focus on repeat customers and referrals for faster scaling."
 });

}





