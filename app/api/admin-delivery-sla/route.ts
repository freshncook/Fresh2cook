import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Assignment = {
  status: string;
  lateDelivery: boolean | null;
  adminAlert: boolean | null;
};

export async function GET() {
  try {
    const now = new Date();

    const pickupBreaches =
      await prisma.deliveryAssignment.updateMany({
        where: {
          status: "Pending Acceptance",
          pickupDeadline: {
            lt: now,
          },
          lateDelivery: false,
        },
        data: {
          lateDelivery: true,
          adminAlert: true,
        },
      });

    const deliveryBreaches =
      await prisma.deliveryAssignment.updateMany({
        where: {
          status: {
            not: "Delivered",
          },
          deliveryDeadline: {
            lt: now,
          },
          lateDelivery: false,
        },
        data: {
          lateDelivery: true,
          adminAlert: true,
        },
      });

    const assignments: Assignment[] =
      await prisma.deliveryAssignment.findMany({
        orderBy: {
          assignedAt: "desc",
        },
      });

    const total =
      assignments.length;

    const delivered =
      assignments.filter(
        (a: Assignment) =>
          a.status === "Delivered"
      ).length;

    const late =
      assignments.filter(
        (a: Assignment) =>
          a.lateDelivery === true
      ).length;

    const activeAlerts =
      assignments.filter(
        (a: Assignment) =>
          a.adminAlert === true
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
      success: true,
      total,
      delivered,
      late,
      activeAlerts,
      pickupBreaches:
        pickupBreaches.count,
      deliveryBreaches:
        deliveryBreaches.count,
      sla,
    });
  } catch (error) {
    console.error(
      "DELIVERY SLA ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Load SLA",
      },
      {
        status: 500,
      }
    );
  }
}




