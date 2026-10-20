import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const riders =
    await prisma.deliveryBoy.findMany();

  const zones:any = {};

  riders.forEach(r=>{

    const z =
      String(r.zoneId || 0);

    if(!zones[z]){
      zones[z]={
        zone:z,
        riders:0
      };
    }

    zones[z].riders++;

  });

  return NextResponse.json({
    success:true,
    zones:Object.values(zones)
  });

}





