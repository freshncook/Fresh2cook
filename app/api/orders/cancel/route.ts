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
    if (order && callerOf(request).kind === "customer" && !["Pending", "Confirmed"].includes(String(order.status))) {
      return NextResponse.json({ success: false, error: "This order is already being packed. Please call support to cancel." }, { status: 400 });
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

    if(
      order.status==="Delivered"
    ){
      return NextResponse.json(
        {
          success:false,
          error:"Delivered order cannot be cancelled"
        }
      );
    }

    await prisma.order.update({
      where:{
        id:orderId
      },
      data:{
        status:"Cancelled"
      }
    });

    return NextResponse.json({
      success:true
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


