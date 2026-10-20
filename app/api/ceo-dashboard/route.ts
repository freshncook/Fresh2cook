import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  totalCustomers:1520,
  activeCustomers:1186,
  totalOrders:8450,
  repeatRate:68
 });

}





