import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const riders =
  await prisma.deliveryBoy.findMany({
   where:{
    status:"Online"
   },
   take:20
  });

 return NextResponse.json({
  success:true,
  riders
 });

}





