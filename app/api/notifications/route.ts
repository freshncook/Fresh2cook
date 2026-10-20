import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifications =
    await prisma.notification.findMany({
      orderBy: {
        id: "desc",
      },
    });

  return NextResponse.json(
    notifications
  );
}

export async function POST(
  req: Request
) {
  const body = await req.json();

  const notification =
    await prisma.notification.create({
      data: {
        title: body.title,
        message: body.message,
        read: false,
      },
    });

  return NextResponse.json(
    notification
  );
}






