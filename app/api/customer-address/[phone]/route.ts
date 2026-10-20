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

    const order =
      await prisma.order.create({
        data: {
          customer:
            body.customer ||
            "Customer",

          phone:
            body.phone || "",

          address:
            body.address || "",

          amount:
            Number(
              body.amount || 0
            ),

          latitude:
            body.latitude || null,

          longitude:
            body.longitude || null,

          status:
            "Assigned",
        },
      });

    const availableRiders =
      await prisma.deliveryBoy.findMany({
        where: {
          approvalStatus:
            "Approved",

          status: {
            in: [
              "Online",
              "Available",
              "Active"
            ]
          }
        },

        orderBy: {
          completedDeliveries:
            "asc",
        },
      });

    if (
      availableRiders.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Online Rider Available",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      availableRiders[0];

    const otp =
      generateOTP();

    const pickupDeadline =
      new Date(
        Date.now() +
          3 * 60 * 1000
      );

    const assignment =
      await prisma.deliveryAssignment.create(
        {
          data: {
            orderId:
              order.id,

            deliveryBoyId:
              rider.id,

            otp,

            status:
              "Pending Acceptance",

            assignedAt:
              new Date(),

            pickupDeadline,

            earnings:
              25,

            reassignedCount:
              0,

            autoReassigned:
              false,

            adminAlert:
              false,

            alertSent:
              false,
          },
        }
      );

    return NextResponse.json({
      success: true,
      order,
      assignment,
      rider,
      pickupDeadline,
      message:
        "Order Auto Assigned",
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Create Order",
      },
      {
        status: 500,
      }
    );
  }
}


