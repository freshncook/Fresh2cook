import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.findMany({
   select:{
    id:true,
    name:true,
    latitude:true,
    longitude:true,
    status:true
   }
  });

 return NextResponse.json({
  success:true,
  riders
 });

}





