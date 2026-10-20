import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  repeatCustomers:68,
  churnRisk:12,
  loyaltyCustomers:44,
  growthScore:87
 });

}



