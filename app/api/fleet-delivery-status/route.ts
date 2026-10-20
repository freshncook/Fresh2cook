import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const assignments =
  await prisma.deliveryAssignment.findMany({
   orderBy:{
    assignedAt:"desc"
   },
   take:50
  });

 return NextResponse.json({
  success:true,
  assignments
 });

}





