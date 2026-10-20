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

    const grouped = {
      pendingAcceptance:
        assignments.filter(
          (a: any) =>
            a.status ===
            "Pending Acceptance"
        ),

      accepted:
        assignments.filter(
          (a: any) =>
            a.status ===
            "Accepted"
        ),

      pickedUp:
        assignments.filter(
          (a: any) =>
            a.status ===
            "Picked Up"
        ),

      outForDelivery:
        assignments.filter(
          (a: any) =>
            a.status ===
            "Out For Delivery"
        ),

      delivered:
        assignments.filter(
          (a: any) =>
            a.status ===
            "Delivered"
        ),
    };

    return NextResponse.json(
      grouped
    );
  } catch (error) {
    console.error(
      "ORDER BOARD ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed To Load Order Board",
      },
      {
        status: 500,
      }
    );
  }
}




