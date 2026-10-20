import { NextRequest, NextResponse } from "next/server";

export async function POST(
 request: NextRequest
){

 try{

  const body =
   await request.json();

  return NextResponse.json({
   success:true,
   orderId:
    "order_" + Date.now(),
   amount:
    body.amount || 0
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





