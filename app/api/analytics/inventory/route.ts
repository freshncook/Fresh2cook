import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const products =
   await prisma.product.findMany();

  const totalProducts =
   products.length;

  const totalStock =
   products.reduce(
    (sum:any,p:any)=>
      sum + Number(p.stock || 0),
    0
   );

  return NextResponse.json({
   success:true,
   totalProducts,
   totalStock
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





