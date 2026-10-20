import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  dailyRevenue:18500,
  weeklyRevenue:122000,
  monthlyRevenue:425000,
  avgOrderValue:382
 });

}





