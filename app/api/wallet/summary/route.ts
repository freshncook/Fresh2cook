import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 try {

  const customers =
   await prisma.customer.findMany({
    select:{
     walletBalance:true
    }
   });

  const totalWallet =
   customers.reduce(
    (sum:any,c:any)=>
      sum + Number(c.walletBalance || 0),
    0
   );

  return NextResponse.json({
   success:true,
   totalWallet,
   customers:customers.length
  });

 } catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  },{status:500});

 }

}





