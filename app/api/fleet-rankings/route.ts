import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy:{
          completedDeliveries:"desc"
        },
        take:20
      });

    return NextResponse.json({
      success:true,
      rankings:riders
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





