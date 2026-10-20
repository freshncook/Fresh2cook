import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callerOf, ownsAssignment, ownsOrder } from "@/lib/caller";

export async function POST(
  request: NextRequest
) {
  try {

    const body =
      await request.json();

    const orderId =
      Number(body.orderId);

    const order =
      await prisma.order.findUnique({
        where:{
          id:orderId
        }
      });
    if (order && !ownsOrder(request, order.phone)) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if(!order){
      return NextResponse.json(
        {
          success:false,
          error:"Order not found"
        },
        {
          status:404
        }
      );
    }

    const newOrder =
      await prisma.order.create({
        data:{
          customer:order.customer,
          phone:order.phone,
          address:order.address,
          amount:order.amount,
          status:"Pending",
          processingStep:0
        }
      });

    return NextResponse.json({
      success:true,
      order:newOrder
    });

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


