import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const riders =
      await prisma.deliveryBoy.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    const summary = {
      total:
        riders.length,

      approved:
        riders.filter(
          (r: any) =>
            r.approvalStatus ===
            "Approved"
        ).length,

      pending:
        riders.filter(
          (r: any) =>
            r.approvalStatus ===
            "Pending"
        ).length,

      rejected:
        riders.filter(
          (r: any) =>
            r.approvalStatus ===
            "Rejected"
        ).length,
    };

    return NextResponse.json({
      success: true,
      summary,
      riders,
    });
  } catch (error) {
    console.error(
      "RIDER APPROVAL GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Load Riders",
      },
      {
        status: 500,
      }
    );
  }
}

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

    const status =
      String(
        body.status || ""
      );

    if (!riderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider ID Required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "Approved",
        "Pending",
        "Rejected",
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Status",
        },
        {
          status: 400,
        }
      );
    }

    const rider =
      await prisma.deliveryBoy.findUnique(
        {
          where: {
            id: riderId,
          },
        }
      );

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rider Not Found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedRider =
      await prisma.deliveryBoy.update(
        {
          where: {
            id: riderId,
          },
          data: {
            approvalStatus:
              status,
          },
        }
      );

    return NextResponse.json({
      success: true,
      message:
        `Rider ${status} Successfully`,
      rider:
        updatedRider,
    });
  } catch (error) {
    console.error(
      "RIDER APPROVAL POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed To Update Rider Status",
      },
      {
        status: 500,
      }
    );
  }
}




