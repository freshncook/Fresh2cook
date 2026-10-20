import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
 request:Request
){

 const body =
  await request.json();

 await prisma.deliveryAssignment.update({
  where:{
   id:Number(body.assignmentId)
  },
  data:{
   status:"Delivered",
   deliveredAt:new Date()
  }
 });

 return NextResponse.json({
  success:true
 });

}





