import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const active =
  await prisma.deliveryAssignment.findMany({
   where:{
    status:{
     in:[
      "Accepted",
      "Picked Up",
      "Out For Delivery"
     ]
    }
   },
   take:20
  });

 return NextResponse.json({
  success:true,
  active
 });

}





