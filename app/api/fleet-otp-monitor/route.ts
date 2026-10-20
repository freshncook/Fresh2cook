import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const data =
  await prisma.deliveryAssignment.findMany({
   select:{
    id:true,
    orderId:true,
    otp:true,
    status:true
   },
   take:100
  });

 return NextResponse.json({
  success:true,
  assignments:data
 });

}





