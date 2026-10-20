import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders =
    await prisma.order.findMany();

  const map =
    new Map<
      string,
      number
    >();

  orders.forEach(
    (item: any) => {
      const current =
        map.get(
          item.customer
        ) || 0;

      map.set(
        item.customer,
        current +
          item.amount
      );
    }
  );

  const result =
    Array.from(
      map.entries()
    )
      .map(
        ([customer, total]) => ({
          customer,
          total,
        })
      )
      .sort(
        (a, b) =>
          b.total -
          a.total
      )
      .slice(0, 10);

  return NextResponse.json(
    result
  );
}






