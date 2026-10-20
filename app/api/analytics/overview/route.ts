import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const [
   customers,
   orders,
   products
  ] = await Promise.all([

   prisma.customer.count(),

   prisma.order.count(),

   prisma.product.count()

  ]);

  return NextResponse.json({
   success:true,
   customers,
   orders,
   products
  });

 } catch(error:any){

  return NextResponse.json(
   {
    success:false,
    error:error?.message
   },
   {
    status:500
   }
  );

 }

}





