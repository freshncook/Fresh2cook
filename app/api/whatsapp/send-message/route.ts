import { NextRequest, NextResponse } from "next/server";

export async function POST(
 request: NextRequest
){

 try{

  const body =
   await request.json();

  return NextResponse.json({
   success:true,
   provider:"WhatsApp Cloud API",
   phone:body.phone,
   message:body.message,
   status:"Queued"
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





