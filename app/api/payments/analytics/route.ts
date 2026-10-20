import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  totalTransactions:0,
  successfulPayments:0,
  failedPayments:0,
  totalRevenue:0
 });

}





