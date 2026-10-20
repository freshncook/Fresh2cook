import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const riderId = Number(
      searchParams.get("riderId")
    );

    if (!riderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Rider ID required",
        },
        {
          status: 400,
        }
      );
    }

    const assignments =
      await prisma.deliveryAssignment.findMany({
        where: {
          deliveryBoyId: riderId,
        },
        orderBy: {
          assignedAt: "desc",
        },
      });

    const orderIds =
      assignments.map(
        (a) => a.orderId
      );

    const orders =
      orderIds.length > 0
        ? await prisma.order.findMany({
            where: {
              id: {
                in: orderIds,
              },
            },
          })
        : [];

    const orderMap = new Map(
      orders.map((o) => [o.id, o])
    );

    const result =
      assignments.map((a) => ({
        assignmentId: a.id,
        orderId: a.orderId,
        otp: a.otp,
        status: a.status,
        earnings: a.earnings,
        assignedAt: a.assignedAt,

        customer:
          orderMap.get(a.orderId)
            ?.customer || "",

        phone:
          orderMap.get(a.orderId)
            ?.phone || "",

        address:
          orderMap.get(a.orderId)
            ?.address || "",

        amount:
          orderMap.get(a.orderId)
            ?.amount || 0,
      }));

    return NextResponse.json({
      success: true,
      orders: result,
    });
  } catch (error: any) {
    console.error(
      "RIDER ORDERS ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message 
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}




