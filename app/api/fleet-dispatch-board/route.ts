import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRiderScore } from "@/lib/rider-priority";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        processingStep: {
          gte: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const riders = await prisma.deliveryBoy.findMany({
      orderBy: {
        completedDeliveries: "desc",
      },
    });

    const assignments =
      await prisma.deliveryAssignment.findMany({
        where: {
          status: {
            not: "Delivered",
          },
        },
      });

    const riderLoadMap = new Map<number, number>();

    assignments.forEach((a) => {
      riderLoadMap.set(
        a.deliveryBoyId,
        (riderLoadMap.get(a.deliveryBoyId) || 0) + 1
      );
    });

    const dispatchOrders = orders.map((order: any) => {
      const ranked = riders
        .map((rider: any) => ({
          riderId: rider.id,
          riderName: rider.name,
          score: calculateRiderScore(
            rider,
            order,
            riderLoadMap.get(rider.id) || 0
          ),
          activeOrders:
            riderLoadMap.get(rider.id) || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      return {
        ...order,
        recommendedRiders: ranked,
      };
    });

    const riderSummary = riders.map(
      (rider: any) => ({
        ...rider,
        activeOrders:
          riderLoadMap.get(rider.id) || 0,
      })
    );

    return NextResponse.json({
      success: true,
      orders: dispatchOrders,
      riders: riderSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Dispatch Board Error",
      },
      {
        status: 500,
      }
    );
  }
}

