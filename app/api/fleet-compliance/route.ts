import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const total =
  await prisma.deliveryBoy.count();

 const approved =
  await prisma.deliveryBoy.count({
   where:{
    approvalStatus:"Approved"
   }
  });

 return NextResponse.json({
  success:true,
  totalRiders:total,
  approvedRiders:approved
 });

}





