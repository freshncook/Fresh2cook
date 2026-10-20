import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const zones =
      await prisma.deliveryZone.findMany({
        orderBy: {
          id: "asc",
        },
      });

    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed To Load Zones",
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
    const body = await req.json();

    const zone =
      await prisma.deliveryZone.create({
        data: {
          zoneName:
            body.zoneName,
          sectors:
            body.sectors,
          charge: Number(
            body.charge
          ),
        },
      });

    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed To Create Zone",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request
) {
  try {
    const body = await req.json();

    const zone =
      await prisma.deliveryZone.update({
        where: {
          id: Number(body.id),
        },
        data: {
          zoneName:
            body.zoneName,
          sectors:
            body.sectors,
          charge: Number(
            body.charge
          ),
        },
      });

    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed To Update Zone",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request
) {
  try {
    const body = await req.json();

    await prisma.deliveryZone.delete({
      where: {
        id: Number(body.id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed To Delete Zone",
      },
      {
        status: 500,
      }
    );
  }
}




