import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const riderId =
      Number(
        body.riderId
      );

    const rating =
      Number(
        body.rating
      );

    if (
      !riderId ||
      !rating
    ) {
      return NextResponse.json(
        {
          error:
            "Rider ID And Rating Required",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.findUnique({
        where: {
          id: riderId,
        },
      });

    if (!rider) {
      return NextResponse.json(
        {
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const currentCompleted =
      rider.completedDeliveries ||
      0;

    const currentRating =
      Number(
        rider.rating || 5
      );

    const newRating =
      (
        (currentRating *
          currentCompleted +
          rating) /
        (currentCompleted + 1)
      ).toFixed(2);

    const updatedRider =
      await prisma.deliveryBoy.update({
        where: {
          id: riderId,
        },
        data: {
          rating:
            Number(
              newRating
            ),
        },
      });

    return NextResponse.json({
      success: true,
      rider:
        updatedRider,
      rating:
        updatedRider.rating,
    });
  } catch (error) {
    console.error(
      "DELIVERY RATING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Save Rating",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          rating: "desc",
        },
      });

    return NextResponse.json(
      riders
    );
  } catch (error) {
    console.error(
      "GET RATINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Ratings",
      },
      {
        status: 500,
      }
    );
  }
}




