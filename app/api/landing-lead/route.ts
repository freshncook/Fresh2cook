import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and Phone are required",
        },
        {
          status: 400,
        }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        area: body.area || "Website",
        source: body.source || "Landing Page",
        interest: body.interest || "Fresh2Cook",
        status: "New",
        value: 0,
        nextFollowUp: "",
        avatar: "NA",
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      message: "Lead Created Successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        id: "desc",
      },
      take: 100,
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}




