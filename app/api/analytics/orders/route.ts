import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const totalOrders =
   await prisma.order.count();

  const pendingOrders =
   await prisma.order.count({
    where:{
     status:"PENDING"
    }
   });

  const completedOrders =
   await prisma.order.count({
    where:{
     status:"DELIVERED"
    }
   });

  return NextResponse.json({
   success:true,
   totalOrders,
   pendingOrders,
   completedOrders
  });

 } catch(error:any){

  return NextResponse.json(
   {
    success:false,
    error:error?.message
   },
   { status:500 }
  );

 }

}





