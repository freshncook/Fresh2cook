import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const riders =
  await prisma.deliveryBoy.findMany({
   where:{
    status:"Online"
   }
  });

 return NextResponse.json({
  success:true,
  riders
 });

}





