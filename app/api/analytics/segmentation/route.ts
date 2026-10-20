import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const totalCustomers =
   await prisma.customer.count();

  const vipCustomers =
   await prisma.customer.count({
    where:{
     loyaltyPoints:{
      gte:1000
     }
    }
   });

  return NextResponse.json({
   success:true,
   totalCustomers,
   vipCustomers
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





