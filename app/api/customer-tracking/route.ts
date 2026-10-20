import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  orderStatus:"Out For Delivery",
  eta:"15 Minutes",
  riderName:"Delivery Partner"
 });

}





