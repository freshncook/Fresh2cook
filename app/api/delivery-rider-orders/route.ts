import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const riderId = Number(
      searchParams.get(
        "riderId"
      )
    );

    if (!riderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider ID Required",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.findUnique(
        {
          where: {
            id: riderId,
          },
        }
      );

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const assignments =
      await prisma.deliveryAssignment.findMany(
        {
          where: {
            deliveryBoyId:
              riderId,
          },
          orderBy: {
            assignedAt:
              "desc",
          },
        }
      );

    const orders =
      await Promise.all(
        assignments.map(
          async (
            assignment
          ) => {
            const order =
              await prisma.order.findUnique(
                {
                  where: {
                    id:
                      assignment.orderId,
                  },
                }
              );

            return {
              assignmentId:
                assignment.id,

              orderId:
                assignment.orderId,

              otp:
                assignment.otp,

              status:
                assignment.status,

              assignedAt:
                assignment.assignedAt,

              acceptedAt:
                assignment.acceptedAt,

              pickedAt:
                assignment.pickedAt,

              deliveredAt:
                assignment.deliveredAt,

              pickupDeadline:
                assignment.pickupDeadline,

              deliveryDeadline:
                assignment.deliveryDeadline,

              earnings:
                assignment.earnings,

              lateDelivery:
                assignment.lateDelivery,

              customerRating:
                assignment.customerRating,

              customer:
                order?.customer ||
                "",

              phone:
                order?.phone ||
                "",

              address:
                order?.address ||
                "",

              amount:
                order?.amount ||
                0,

              latitude:
                order?.latitude,

              longitude:
                order?.longitude,

              orderStatus:
                order?.status ||
                "",
            };
          }
        )
      );

    const pending =
      orders.filter(
        (o) =>
          o.status ===
          "Pending Acceptance"
      ).length;

    const accepted =
      orders.filter(
        (o) =>
          o.status ===
          "Accepted"
      ).length;

    const pickedUp =
      orders.filter(
        (o) =>
          o.status ===
          "Picked Up"
      ).length;

    const delivered =
      orders.filter(
        (o) =>
          o.status ===
          "Delivered"
      ).length;

    return NextResponse.json({
      success: true,

      rider: {
        id:
          rider.id,
        name:
          rider.name,
        mobile:
          rider.mobile,
        status:
          rider.status,
      },

      summary: {
        total:
          orders.length,
        pending,
        accepted,
        pickedUp,
        delivered,
      },

      orders,
    });
  } catch (error) {
    console.error(
      "RIDER ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Load Orders",
      },
      {
        status: 500,
      }
    );
  }
}




