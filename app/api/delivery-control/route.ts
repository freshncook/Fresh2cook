import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          completedDeliveries: "desc",
        },
      });

    const assignments =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          assignedAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      riders,
      assignments,
    });
  } catch (error) {
    console.error(
      "DELIVERY CONTROL GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed To Load Delivery Data",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = Number(body?.orderId);
    const zoneId =
      body?.zoneId !== undefined &&
      body?.zoneId !== null &&
      body?.zoneId !== ""
        ? Number(body.zoneId)
        : null;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid Order ID required",
        },
        {
          status: 400,
        }
      );
    }

    const existingAssignment =
      await prisma.deliveryAssignment.findFirst({
        where: {
          orderId,
        },
      });

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Order Already Assigned",
        },
        {
          status: 409,
        }
      );
    }

    const availableRiders =
      await prisma.deliveryBoy.findMany({
        where: {
          approvalStatus: "Approved",
          status: {
            in: ["Online", "Available"],
          },
        },
        orderBy: [
          {
            completedDeliveries: "asc",
          },
          {
            rating: "desc",
          },
        ],
      });

    if (availableRiders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No Online Rider Available",
        },
        {
          status: 400,
        }
      );
    }

    const selectedRider =
      availableRiders[0];

    const assignment =
      await prisma.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId:
            selectedRider.id,

          ...(zoneId !== null
            ? { zoneId }
            : {}),

          /*
           * OTP intentionally remains empty.
           * It will be generated only when
           * the rider starts the delivery OTP flow.
           */
          otp: "",

          status:
            "Pending Acceptance",

          assignedAt:
            new Date(),

          earnings: 25,
        },
      });

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status:
          "Assigned To Rider",

        deliveryOtp: null,
      },
    });

    return NextResponse.json({
      success: true,
      rider: {
        id: selectedRider.id,
        name: selectedRider.name,
        mobile: selectedRider.mobile,
        vehicle: selectedRider.vehicle,
      },
      assignment,
    });
  } catch (error) {
    console.error(
      "AUTO ASSIGN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Assignment Failed",
      },
      {
        status: 500,
      }
    );
  }
}




