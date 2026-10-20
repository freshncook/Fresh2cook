import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const orders = await prisma.order.findMany();

  const revenue =
   orders.reduce(
    (sum:any,order:any)=>
      sum + Number(order.total || 0),
    0
   );

  return NextResponse.json({
   success:true,
   revenue,
   totalOrders:orders.length
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





