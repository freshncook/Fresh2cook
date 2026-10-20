import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.findMany({
   select:{
    id:true,
    name:true,
    earnings:true,
    completedDeliveries:true
   }
  });

 return NextResponse.json({
  success:true,
  riders
 });

}





