import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  cashbackToday:850,
  cashbackMonth:12450,
  customersRewarded:118
 });

}





