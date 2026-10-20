import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const tasks =
  await prisma.deliveryAssignment.findMany({
   where:{
    status:{
     not:"Delivered"
    }
   },
   orderBy:{
    assignedAt:"desc"
   }
  });

 return NextResponse.json({
  success:true,
  tasks
 });

}





