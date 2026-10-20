import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  nextMonthRevenue:510000,
  nextMonthProfit:172000,
  growthForecast:20
 });

}





