import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const totalCustomers =
   await prisma.customer.count();

  return NextResponse.json({
   success:true,
   totalCustomers
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





