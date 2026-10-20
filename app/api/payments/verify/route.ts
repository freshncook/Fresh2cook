import { NextRequest, NextResponse } from "next/server";

export async function POST(
 request: NextRequest
){

 try{

  const body =
   await request.json();

  return NextResponse.json({
   success:true,
   verified:true,
   paymentId:body.paymentId
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





