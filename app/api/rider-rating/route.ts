import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const assignmentId =
      Number(
        body.assignmentId
      );

    const rating =
      Number(
        body.rating
      );

    if (
      !assignmentId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assignment ID Required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rating Must Be Between 1 And 5",
        },
        {
          status: 400,
        }
      );
    }

    const assignment =
      await prisma.deliveryAssignment.findUnique(
        {
          where: {
            id:
              assignmentId,
          },
        }
      );

    if (
      !assignment
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assignment Not Found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      assignment.status !==
      "Delivered"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order Not Delivered Yet",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.deliveryAssignment.update(
      {
        where: {
          id:
            assignmentId,
        },
        data: {
          customerRating:
            rating,
        },
      }
    );

    const riderAssignments =
      await prisma.deliveryAssignment.findMany(
        {
          where: {
            deliveryBoyId:
              assignment.deliveryBoyId,
            customerRating: {
              not: null,
            },
          },
        }
      );

    const totalRatings =
      riderAssignments.reduce(
        (
          total,
          item
        ) =>
          total +
          (item.customerRating ||
            0),
        0
      );

    const averageRating =
      riderAssignments.length
        ? Number(
            (
              totalRatings /
              riderAssignments.length
            ).toFixed(1)
          )
        : 5;

    await prisma.deliveryBoy.update(
      {
        where: {
          id:
            assignment.deliveryBoyId,
        },
        data: {
          rating:
            averageRating,
        },
      }
    );

    return NextResponse.json({
      success: true,
      rating,
      averageRating,
      message:
        "Rating Submitted Successfully",
    });
  } catch (error) {
    console.error(
      "RIDER RATING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Submit Rating",
      },
      {
        status: 500,
      }
    );
  }
}




