import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

 const riders =
  await prisma.deliveryBoy.findMany({
   select:{
    id:true,
    name:true,
    aadhaar:true,
    approvalStatus:true,
    aadhaarFront:true,
    aadhaarBack:true,
    licenseFile:true,
    rcFile:true
   }
  });

 return NextResponse.json({
  success:true,
  riders
 });

}





