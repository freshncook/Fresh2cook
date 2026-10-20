import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const customers =
   await prisma.customer.findMany();

  const churnRisk =
   customers.filter(
    (c:any)=>
      Number(c.totalOrders || 0) === 0
   ).length;

  return NextResponse.json({
   success:true,
   churnRisk
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





