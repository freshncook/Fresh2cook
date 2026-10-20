import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  try {

    const phone =
      request.nextUrl.searchParams.get(
        "phone"
      );

    if(!phone){
      return NextResponse.json([]);
    }

    const orders =
      await prisma.order.findMany({
        where:{
          phone
        },
        orderBy:{
          createdAt:"desc"
        },
        take:50
      });

    return NextResponse.json(
      orders
    );

  } catch(error:any){

    return NextResponse.json(
      {
        success:false,
        error:error?.message
      },
      {
        status:500
      }
    );

  }
}


