import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOTP() {
  return Math.floor(
    1000 + Math.random() * 9000
  ).toString();
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const orderId = Number(
      body.orderId
    );

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID Required",
        },
        {
          status: 400,
        }
      );
    }

    const riders =
      await prisma.deliveryBoy.findMany({
        where: {
          status: "Available",
        },
      });

    if (!riders.length) {
      return NextResponse.json(
        {
          error:
            "No Rider Available",
        },
        {
          status: 400,
        }
      );
    }

    const riderStats =
      await Promise.all(
        riders.map(
          async (rider) => {
            const pending =
              await prisma.deliveryAssignment.count(
                {
                  where: {
                    deliveryBoyId:
                      rider.id,
                    status: {
                      not:
                        "Delivered",
                    },
                  },
                }
              );

            return {
              rider,
              pending,
            };
          }
        )
      );

    riderStats.sort(
      (a, b) => {
        if (
          a.pending !==
          b.pending
        ) {
          return (
            a.pending -
            b.pending
          );
        }

        return (
          b.rider.rating -
          a.rider.rating
        );
      }
    );

    const selected =
      riderStats[0];

    const assignment =
      await prisma.deliveryAssignment.create(
        {
          data: {
            orderId,
            deliveryBoyId:
              selected.rider.id,
            otp:
              generateOTP(),
            status:
              "Pending Acceptance",
          },
        }
      );

    return NextResponse.json({
      success: true,
      assignment,
      rider:
        selected.rider,
    });
  } catch (error) {
    console.error(
      "AUTO ASSIGN ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Assign Order",
      },
      {
        status: 500,
      }
    );
  }
}




