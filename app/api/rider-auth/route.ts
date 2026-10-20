import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request){

 const body = await request.json();

 const rider =
  await prisma.deliveryBoy.findFirst({
   where:{
    mobile: body.mobile
   }
  });

 if(!rider){
  return NextResponse.json({
   success:false,
   message:"Rider Not Found"
  });
 }

 return NextResponse.json({
  success:true,
  riderId:rider.id,
  riderName:rider.name,
  status:rider.status
 });

}





