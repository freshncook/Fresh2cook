import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.findMany({
   orderBy:{
    completedDeliveries:"desc"
   },
   take:20
  });

 return NextResponse.json({
  success:true,
  rewards:riders.map(r=>({
   rider:r.name,
   reward:
    r.completedDeliveries >= 100
    ? "Gold"
    : r.completedDeliveries >= 50
    ? "Silver"
    : "Bronze"
  }))
 });

}





