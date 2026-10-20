import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.findMany();

 const payroll =
  riders.map(r=>({
   rider:r.name,
   earnings:r.earnings,
   incentive:
    (r.completedDeliveries || 0) * 2
  }));

 return NextResponse.json({
  success:true,
  payroll
 });

}





