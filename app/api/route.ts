import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany();

    const assignments =
      await prisma.deliveryAssignment.findMany(
        {
          where: {
            status:
              "Delivered",
          },
        }
      );

    const leaderboard =
      riders.map(
        (rider) => {
          const deliveries =
            assignments.filter(
              (a) =>
                a.deliveryBoyId ===
                rider.id
            );

          const totalDeliveries =
            deliveries.length;

          const totalEarnings =
            deliveries.reduce(
              (
                total,
                current
              ) =>
                total +
                (current.earnings ||
                  0),
              0
            );

          const ratingCount =
            deliveries.filter(
              (d) =>
                d.customerRating
            ).length;

          const averageRating =
            ratingCount > 0
              ? Number(
                  (
                    deliveries.reduce(
                      (
                        total,
                        current
                      ) =>
                        total +
                        (current.customerRating ||
                          0),
                      0
                    ) /
                    ratingCount
                  ).toFixed(1)
                )
              : rider.rating;

          return {
            riderId:
              rider.id,

            riderName:
              rider.name,

            mobile:
              rider.mobile,

            completedDeliveries:
              totalDeliveries,

            earnings:
              totalEarnings,

            averageRating,

            score:
              totalDeliveries *
                10 +
              averageRating *
                20,
          };
        }
      );

    leaderboard.sort(
      (a, b) =>
        b.score -
        a.score
    );

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(
      "DELIVERY LEADERBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Load Leaderboard",
      },
      {
        status: 500,
      }
    );
  }
}



