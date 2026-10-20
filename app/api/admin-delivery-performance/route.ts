import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Assignment = {
  status: string;
  lateDelivery: boolean | null;
};

export async function GET() {
  try {
    const assignments: Assignment[] =
      await prisma.deliveryAssignment.findMany();

    const total =
      assignments.length;

    const delivered =
      assignments.filter(
        (x: Assignment) =>
          x.status ===
          "Delivered"
      ).length;

    const late =
      assignments.filter(
        (x: Assignment) =>
          Boolean(
            x.lateDelivery
          )
      ).length;

    const sla =
      total > 0
        ? Number(
            (
              ((total - late) /
                total) *
              100
            ).toFixed(2)
          )
        : 100;

    return NextResponse.json({
      total,
      delivered,
      late,
      sla,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed To Load Performance",
      },
      {
        status: 500,
      }
    );
  }
}




