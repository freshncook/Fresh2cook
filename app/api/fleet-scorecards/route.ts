import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  try {

    const riders =
      await prisma.deliveryBoy.findMany();

    const totalRiders =
      riders.length;

    const onlineRiders =
      riders.filter(
        r => r.status === "Online"
      ).length;

    const totalDeliveries =
      riders.reduce(
        (s,r)=>
          s + r.completedDeliveries,
        0
      );

    return NextResponse.json({
      success:true,
      scorecards:{
        totalRiders,
        onlineRiders,
        totalDeliveries
      }
    });

  } catch(error:any){

    return NextResponse.json(
      {
        success:false,
        error:error?.message
      },
      {status:500}
    );

  }

}





