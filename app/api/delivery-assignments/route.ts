import { calculateRiderScore } from "@/lib/rider-priority";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          id: "desc",
        },
      });

    const orderIds = [
      ...new Set(
        assignments.map(
          (item) => item.orderId
        )
      ),
    ];

    const riderIds = [
      ...new Set(
        assignments.map(
          (item) => item.deliveryBoyId
        )
      ),
    ];

    const orders =
      orderIds.length > 0
        ? await prisma.order.findMany({
            where: {
              id: {
                in: orderIds,
              },
            },
            select: {
              id: true,
              customer: true,
              phone: true,
              address: true,
              amount: true,
              status: true,
              createdAt: true,
              deliveryOtp: true,
            },
          })
        : [];

    const riders =
      riderIds.length > 0
        ? await prisma.deliveryBoy.findMany({
            where: {
              id: {
                in: riderIds,
              },
            },
            select: {
  id: true,
  name: true,
  mobile: true,
  vehicle: true,
  status: true,
  zoneId: true
},
          })
        : [];

    const orderMap = new Map(
      orders.map((order) => [
        order.id,
        order,
      ])
    );

    const riderMap = new Map(
      riders.map((rider) => [
        rider.id,
        rider,
      ])
    );

    const cleaned = assignments.map(
      (assignment) => {
        const order =
          orderMap.get(
            assignment.orderId
          );

        const rider =
          riderMap.get(
            assignment.deliveryBoyId
          );

        return {
          ...assignment,

          otp:
            assignment.status ===
            "Otp Sent"
              ? assignment.otp
              : null,

          order: order
            ? {
                id: order.id,
                customer:
                  order.customer,
                phone:
                  order.phone,
                address:
                  order.address,
                amount:
                  order.amount,
                status:
                  order.status,
                createdAt:
                  order.createdAt,
                deliveryOtp:
                  assignment.status ===
                  "Otp Sent"
                    ? order.deliveryOtp
                    : null,
              }
            : null,

          deliveryBoy: rider
            ? {
                id: rider.id,
                name: rider.name,
                mobile:
                  rider.mobile,
                vehicle:
                  rider.vehicle,
                status:
                  rider.status,
                zoneId:
                  rider.zoneId,

                activeOrders:
                  assignments.filter(
                    (a) =>
                      a.deliveryBoyId ===
                        rider.id &&
                      ![
                        "Delivered",
                        "Cancelled",
                      ].includes(
                        a.status
                      )
                  ).length,

                capacityReached:
                  assignments.filter(
                    (a) =>
                      a.deliveryBoyId ===
                        rider.id &&
                      ![
                        "Delivered",
                        "Cancelled",
                      ].includes(
                        a.status
                      )
                  ).length >= 5,

                score:
                  calculateRiderScore(
                    rider,
                    order
                  ),
              }
            : null,
        };
      }
    );

    cleaned.sort(
(a,b)=>
Number(b.riderScore||0)-
Number(a.riderScore||0)
);

return NextResponse.json({
success:true,
assignments:cleaned,
});
  } catch (error) {
    console.error(
      "DELIVERY ASSIGNMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed To Load Assignments",
      },
      {
        status: 500,
      }
    );
  }
}








