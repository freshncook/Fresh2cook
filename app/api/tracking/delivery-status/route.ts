import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  orderId:"ORD001",
  status:"Out For Delivery",
  eta:"15 Minutes"
 });

}





