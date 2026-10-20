import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callerOf, ownsAssignment, ownsOrder } from "@/lib/caller";

export async function POST(req:Request){

 try{

  const body = await req.json();
    if (callerOf(req).kind === "rider") body.riderId = callerOf(req).id; // a rider can only change their own status

  await prisma.deliveryBoy.update({
   where:{
    id:Number(body.riderId)
   },
   data:{
    status:body.status
   }
  });

  return NextResponse.json({
   success:true
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  });

 }

}





