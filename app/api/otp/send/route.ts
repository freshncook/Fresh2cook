import { NextRequest, NextResponse } from "next/server";

export async function POST(
 request: NextRequest
){

 try{

  const body =
   await request.json();

  const otp =
   Math.floor(
    100000 + Math.random()*900000
   );

  return NextResponse.json({
   success:true,
   phone:body.phone,
   otp
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





