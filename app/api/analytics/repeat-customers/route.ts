import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const customers =
   await prisma.customer.findMany();

  const repeatCustomers =
   customers.filter(
    (c:any)=>
      Number(c.totalOrders || 0) > 1
   ).length;

  return NextResponse.json({
   success:true,
   repeatCustomers,
   totalCustomers:customers.length
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





