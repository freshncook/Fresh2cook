import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.count();

 const online =
  await prisma.deliveryBoy.count({
   where:{status:"Online"}
  });

 const assignments =
  await prisma.deliveryAssignment.count();

 return NextResponse.json({
  success:true,
  riders,
  online,
  assignments
 });

}





