import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedback = await prisma.customerFeedback.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(feedback, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "GET FEEDBACK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load feedback",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer = String(
      body?.name || ""
    ).trim();

    const phone = String(
      body?.phone || ""
    ).trim();

    const rating = Number(
      body?.rating
    );

    const comment = String(
      body?.review || ""
    ).trim();

    if (!customer) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Mobile number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          error: "Review is required.",
        },
        {
          status: 400,
        }
      );
    }

    const feedback =
      await prisma.customerFeedback.create({
        data: {
          customer,
          phone,
          rating,
          comment,
        },
      });

    return NextResponse.json(
      {
        success: true,
        feedback,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE FEEDBACK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save feedback",
      },
      {
        status: 500,
      }
    );
  }
}





