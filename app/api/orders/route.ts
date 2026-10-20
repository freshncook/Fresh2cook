import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { defaultPack, packOptions, priceForPack } from "@/lib/pack-price";
import { callerOf } from "@/lib/caller";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function generateOTP() {
  return Math.floor(
    1000 + Math.random() * 9000
  ).toString();
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load orders",
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
      body?.customer || ""
    ).trim();

    const phone = String(
      body?.phone || ""
    ).trim();

    const address = String(
      body?.address || ""
    ).trim();

    const amount = Math.round(
      Number(body?.amount || 0)
    );

    const cartItems = Array.isArray(
      body?.items
    )
      ? body.items
      : [];

    if (!customer) {
      return NextResponse.json(
        {
          error:
            "Customer name is required",
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
            "Customer phone is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Valid order amount is required",
        },
        {
          status: 400,
        }
      );
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "Order must contain at least one item",
        },
        {
          status: 400,
        }
      );
    }

    const deliveryOtp =
      generateOTP();

    // ---- Prices come from the database, never from the browser ----
    const ids = [...new Set(cartItems.map((i: any) => Number(i?.id || 0)).filter((n: number) => Number.isInteger(n) && n > 0))] as number[];
    const products = ids.length ? await prisma.product.findMany({ where: { id: { in: ids } } }) : [];
    const byId = new Map(products.map((p) => [p.id, p]));
    const shop = await getStoreSettings();
    const rules = { packExtra500: shop.packExtra500, packExtra250: shop.packExtra250, packSizes: shop.packSizes };

    // Admin POS may sell at its own price; customers always pay the shop price
    const isAdmin = callerOf(req).kind === "admin";
    const problems: string[] = [];
    const orderItems = cartItems
      .map((item: any) => {
        const productId = Number(item?.id || 0);
        const quantity = Math.min(100, Math.max(1, Math.round(Number(item?.qty || 1))));
        const p = byId.get(productId);
        if (!p || (p as any).active === false) {
          problems.push(String(item?.name || "An item") + " is no longer available");
          return null;
        }
        const wanted = String(item?.pack || "").trim();
        const pack = wanted ? wanted : defaultPack(p.pack);
        if (!isAdmin && !packOptions(p.pack, rules).includes(pack) && pack !== defaultPack(p.pack)) {
          problems.push(p.name + " (" + pack + ") is not sold in this pack any more");
          return null;
        }
        const shopPrice = priceForPack(p, pack, rules).price;
        const price = isAdmin && Number(item?.price) > 0 ? Math.round(Number(item.price)) : shopPrice;
        return { productId, productName: p.name, pack, quantity, price, total: price * quantity };
      })
      .filter(Boolean) as { productId: number; productName: string; pack: string; quantity: number; price: number; total: number }[];

    if (problems.length) {
      return NextResponse.json(
        { success: false, error: problems.join(". ") + ". Please remove it from the cart and add it again." },
        { status: 409 }
      );
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No valid products found in cart" }, { status: 400 });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
    const handling = subtotal > 0 ? shop.handlingCharge : 0;
    const delivery = subtotal >= shop.freeDeliveryTarget ? 0 : shop.deliveryCharge;
    const serverAmount = subtotal + handling + delivery;

    // The customer paid (UPI) the amount shown in the browser. If that is less than the real
    // price, stop and ask them to refresh the cart instead of saving a wrong bill.
    if (!isAdmin && amount + 1 < serverAmount) {
      return NextResponse.json(
        { success: false, error: "Prices have changed. Please open the cart again to see the latest price, then place the order." },
        { status: 409 }
      );
    }

    const order =
      await prisma.order.create({
        data: {
          customer,
          phone,
          address,
          amount: isAdmin && amount > 0 ? amount : serverAmount,
          status: "Pending",
          deliveryOtp,
        },
      });

    try {
      await prisma.orderItem.createMany({
        data: orderItems.map(
  (item: any) => ({
    orderId: order.id,
    productId: item.productId,
    productName: item.productName,
    pack: item.pack,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
  }))
,
      });
    } catch (itemError) {
      // If order items fail, remove the
      // parent order so we don't leave
      // an incomplete order behind.
      try {
        await prisma.order.delete({
          where: {
            id: order.id,
          },
        });
      } catch {}

      throw itemError;
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          deliveryOtp,
        },
        deliveryOtp,
        items: orderItems,
        message:
          `Order Confirmed. Delivery OTP: ${deliveryOtp}`,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: Request
) {
  try {
    const body = await req.json();

    const id = Number(
      body?.id
    );

    const status = String(
      body?.status || ""
    ).trim();

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            "Valid order ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ORDER_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order status",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const updated =
      await prisma.order.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order",
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

    const id = Number(
      body?.id
    );

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            "Valid order ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    });

    await prisma.order.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(
      "DELETE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete order",
      },
      {
        status: 500,
      }
    );
  }
}






