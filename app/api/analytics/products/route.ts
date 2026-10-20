import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const products =
   await prisma.product.findMany({
    take:10
   });

  return NextResponse.json({
   success:true,
   products
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





