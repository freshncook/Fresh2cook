import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const online =
  await prisma.deliveryBoy.count({
   where:{status:"Online"}
  });

 const total =
  await prisma.deliveryBoy.count();

 return NextResponse.json({
  success:true,
  onlineRiders:online,
  totalRiders:total
 });

}





