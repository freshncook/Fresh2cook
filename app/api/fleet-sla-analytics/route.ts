import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){

 const total =
  await prisma.deliveryAssignment.count();

 const late =
  await prisma.deliveryAssignment.count({
   where:{
    lateDelivery:true
   }
  });

 return NextResponse.json({
  success:true,
  totalAssignments:total,
  lateAssignments:late,
  slaPercent:
   total===0
   ?100
   :Math.round(
     ((total-late)/total)*100
    )
 });

}





