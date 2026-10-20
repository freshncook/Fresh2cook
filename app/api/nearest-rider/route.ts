import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 try{

  const rider =
   await prisma.deliveryBoy.findFirst({
    where:{
     status:"Online"
    },
    orderBy:{
     completedDeliveries:"desc"
    }
   });

  return NextResponse.json({
   success:true,
   rider
  });

 }catch(error:any){

  return NextResponse.json({
   success:false,
   error:error?.message
  });

 }

}





