import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  totalCustomers:1520,
  activeCustomers:1186,
  repeatCustomers:824,
  churnRisk:96
 });

}





