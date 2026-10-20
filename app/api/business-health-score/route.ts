import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  score:88,
  status:"Healthy",
  revenueHealth:90,
  customerHealth:86,
  operationsHealth:88
 });

}





