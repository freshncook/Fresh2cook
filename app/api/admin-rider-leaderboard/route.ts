import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          completedDeliveries:
            "desc",
        },
      });

    const leaderboard =
      riders.map(
        (rider, index) => ({
          rank:
            index + 1,

          id:
            rider.id,

          name:
            rider.name,

          mobile:
            rider.mobile,

          rating:
            rider.rating,

          deliveries:
            rider.completedDeliveries,

          earnings:
            rider.earnings,

          status:
            rider.status,

          badge:
            rider.rating >=
            4.8
              ? "🥇 Elite"
              : rider.rating >=
                4.5
              ? "🥈 Pro"
              : rider.rating >=
                4
              ? "🥉 Active"
              : "⭐ New",

          performance:
            rider.completedDeliveries >
            300
              ? "Excellent"
              : rider.completedDeliveries >
                150
              ? "Good"
              : "Average",
        })
      );

    const topRider =
      leaderboard[0] ||
      null;

    const highestRating =
      [...leaderboard].sort(
        (a, b) =>
          b.rating -
          a.rating
      )[0] || null;

    const highestEarning =
      [...leaderboard].sort(
        (a, b) =>
          b.earnings -
          a.earnings
      )[0] || null;

    return NextResponse.json({
      success: true,

      summary: {
        totalRiders:
          riders.length,

        topRider,

        highestRating,

        highestEarning,
      },

      leaderboard,
    });
  } catch (error) {
    console.error(
      "LEADERBOARD ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Leaderboard",
      },
      {
        status: 500,
      }
    );
  }
}




