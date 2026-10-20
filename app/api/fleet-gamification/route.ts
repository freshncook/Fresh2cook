import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const riders =
  await prisma.deliveryBoy.findMany({
   orderBy:{
    completedDeliveries:"desc"
   },
   take:10
  });

 return NextResponse.json({
  success:true,
  leaderboard:riders
 });

}





