import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      customer: body.customer,
      due: body.due,
      type: body.type,
      done: false,
    },
  });

  return NextResponse.json(task);
}






