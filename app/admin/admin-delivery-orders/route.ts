import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          assignedAt: "desc",
        },
      });

    const orders =
      await Promise.all(
        assignments.map(
  async (
    assignment: any
  ) => {
            const order =
              await prisma.order.findUnique({
                where: {
                  id:
                    assignment.orderId,
                },
              });

            const rider =
              await prisma.deliveryBoy.findUnique({
                where: {
                  id:
                    assignment.deliveryBoyId,
                },
              });

            return {
              ...assignment,

              order,

              rider,
            };
          }
        )
      );

    return NextResponse.json(
      orders
    );
  } catch (error) {
    console.error(
      "ADMIN DELIVERY ORDERS ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Orders",
      },
      {
        status: 500,
      }
    );
  }
}




