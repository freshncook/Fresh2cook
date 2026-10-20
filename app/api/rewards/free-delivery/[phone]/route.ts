import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  currentMonth:125000,
  nextMonthForecast:148000,
  growthPercent:18
 });

}



