import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const delayed =
  await prisma.deliveryAssignment.findMany({
   where:{
    lateDelivery:true
   },
   take:20
  });

 return NextResponse.json({
  success:true,
  candidates:delayed
 });

}





