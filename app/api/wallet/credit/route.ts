import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
 request: NextRequest
){

 try{

  const body =
   await request.json();

  return NextResponse.json({
   success:true,
   customerId:body.customerId,
   credit:body.amount
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





