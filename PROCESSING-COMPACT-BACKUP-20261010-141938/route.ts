import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

const STARTABLE_STATUSES = [
  "Pending",
  "Confirmed",
  "Paid",
  "Payment Received",
];

const TERMINAL_STATUSES = [
  "Delivered",
  "Cancelled",
];

type SessionLike = {
  kind?: string;
  role?: string;
  name?: string;
  mobile?: string;
  phone?: string;
  staffId?: number;
  id?: number;
  userId?: number;
};

async function getProcessingStaff() {
  const session =
    await getCurrentSession();

  const data =
    session as SessionLike | null;

  if (
    !data ||
    data.kind !== "staff" ||
    String(data.role).toUpperCase() !==
      "PROCESSING"
  ) {
    return null;
  }

  const candidateId = Number(
    data.staffId || data.id || data.userId || 0
  );

  if (
    Number.isInteger(candidateId) &&
    candidateId > 0
  ) {
    const staff =
      await prisma.staffUser.findUnique({
        where: {
          id: candidateId,
        },
      });

    if (
      staff &&
      staff.active &&
      String(staff.role).toUpperCase() ===
        "PROCESSING"
    ) {
      return {
        session: data,
        staff,
      };
    }
  }

  const mobile =
    String(
      data.mobile || data.phone || ""
    ).trim();

  if (mobile) {
    const staff =
      await prisma.staffUser.findUnique({
        where: {
          mobile,
        },
      });

    if (
      staff &&
      staff.active &&
      String(staff.role).toUpperCase() ===
        "PROCESSING"
    ) {
      return {
        session: data,
        staff,
      };
    }
  }

  const name =
    String(
      data.name || ""
    ).trim();

  if (name) {
    const staff =
      await prisma.staffUser.findFirst({
        where: {
          name,
          active: true,
          role: "PROCESSING",
        },
      });

    if (staff) {
      return {
        session: data,
        staff,
      };
    }
  }

  return null;
}

async function buildOrders() {
  const orders =
    await prisma.order.findMany({
      where: {
        status: {
          notIn:
            TERMINAL_STATUSES,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const orderIds =
    orders.map(
      (order) => order.id
    );

  const orderItems =
    orderIds.length > 0
      ? await prisma.orderItem.findMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
          orderBy: {
            id: "asc",
          },
        })
      : [];

  const productIds = [
    ...new Set(
      orderItems.map(
        (item) =>
          item.productId
      )
    ),
  ];

  const riders = await prisma.deliveryBoy.findMany({
  where:{
    approvalStatus:"Approved"
  },
  select:{
    id:true,
    name:true,
    mobile:true,
    rating:true,
    completedDeliveries:true
  },
  orderBy:[
    { rating:"desc" },
    { completedDeliveries:"desc" }
  ]
})

const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      pack: true,
    },
  });

  const productMap =
    new Map(
      products.map(
        (product) => [
          product.id,
          product,
        ]
      )
    );

  const itemsByOrder =
    new Map<number, any[]>();

  for (const item of orderItems) {
    const product =
      productMap.get(
        item.productId
      );

    const mapped = {
      id: item.id,
      productId:
        item.productId,
      productName:
        product?.name ||
        item.productName ||
        "Product",
      packSize:
        (product as any)?.pack ||
        (product as any)?.packSize ||
        (item as any).packSize ||
        (item as any).pack ||
        "-",
      pack:
        (product as any)?.pack ||
        (product as any)?.packSize ||
        (item as any).packSize ||
        (item as any).pack ||
        "-",
      variantName: (item as any).variantName || null,
      quantity:
        Number(
          item.quantity || 0
        ),
      price:
        Number(
          item.price || 0
        ),
      total:
        Number(
          item.total || 0
        ),
      packed:
        Boolean(item.packed),
    };

    const existing =
      itemsByOrder.get(
        item.orderId
      ) || [];

    existing.push(mapped);

    itemsByOrder.set(
      item.orderId,
      existing
    );
  }

  const processingIds = [
    ...new Set(
      orders
        .flatMap(
          (order) => [
            order.processingAcceptedById,
            order.processingPreparedById,
            order.processingCrossCheckedById,
            order.processingStickerById,
            order.processingPackagingById,
            order.processingDispatchedById,
          ]
        )
        .filter(
          (
            id
          ): id is number =>
            Number.isInteger(id)
        )
    ),
  ];

  const staff =
    processingIds.length > 0
      ? await prisma.staffUser.findMany({
          where: {
            id: {
              in: processingIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const staffMap =
    new Map(
      staff.map(
        (person) => [
          person.id,
          person.name,
        ]
      )
    );

  return orders.map(
    (order) => ({
      ...order,
      address:
        (order as any).address ||
        (order as any).deliveryAddress ||
        (order as any).shippingAddress ||
        (order as any).customerAddress ||
        null,
      deliveryAddress:
        (order as any).deliveryAddress ||
        (order as any).address ||
        (order as any).shippingAddress ||
        (order as any).customerAddress ||
        null,

      acceptedByName:
        order.processingAcceptedById
          ? staffMap.get(
              order.processingAcceptedById
            ) || "Staff"
          : null,

      preparedByName:
        order.processingPreparedById
          ? staffMap.get(
              order.processingPreparedById
            ) || "Staff"
          : null,

      crossCheckedByName:
        order.processingCrossCheckedById
          ? staffMap.get(
              order.processingCrossCheckedById
            ) || "Staff"
          : null,

      stickerByName:
        order.processingStickerById
          ? staffMap.get(
              order.processingStickerById
            ) || "Staff"
          : null,

      packagingByName:
        order.processingPackagingById
          ? staffMap.get(
              order.processingPackagingById
            ) || "Staff"
          : null,

      dispatchedByName:
        order.processingDispatchedById
          ? staffMap.get(
              order.processingDispatchedById
            ) || "Staff"
          : null,

      items:
        itemsByOrder.get(
          order.id
        ) || [],
    })
  );
}

export async function GET() {
  try {
    const current =
      await getProcessingStaff();

    if (!current) {
      return NextResponse.json(
        {
          error:
            "Processing session expired. Please login again.",
        },
        { status: 401 }
      );
    }

    const riders = await prisma.deliveryBoy.findMany({
  where: {
    approvalStatus: "Approved",
  },
  select: {
    id: true,
    name: true,
    rating: true,
  },
  orderBy: {
    rating: "desc",
  },
});

const orders =
      await buildOrders();

    return NextResponse.json({
      success: true,

      currentStaff: {
        id: current.staff.id,
        name: current.staff.name,
        mobile:
          current.staff.mobile,
      },

        riders,
      orders,
    });
  } catch (error) {
    console.error(
      "PROCESSING GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load orders",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request
) {
  try {
    const current =
      await getProcessingStaff();

    if (!current) {
      return NextResponse.json(
        {
          error:
            "Processing session expired. Please login again.",
        },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    const action =
      String(
        body?.action || ""
      ).trim();

    const orderId =
  Number(
    body?.orderId || body?.id
  );

    const now =
      new Date();

    /*
     * ======================================================
     * STEP 1 0 ACCEPT ORDER
     * ======================================================
     */

    if (
      action ===
      "accept"
    ) {
      if (
        !Number.isInteger(
          orderId
        ) ||
        orderId <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Valid order ID required",
          },
          { status: 400 }
        );
      }

      const deadline =
        new Date(
          now.getTime() +
            30 * 60 * 1000
        );

      /*
       * Atomic claim:
       * only first staff member can accept.
       */
      const claimed =
        await prisma.order.updateMany({
          where: {
            id: orderId,

            status: {
              in:
                STARTABLE_STATUSES,
            },

            processingAcceptedAt:
              null,
          },

          data: {
            status:
              "Processing",

            processingStep:
              1,

            processingAcceptedById:
              current.staff.id,

            processingAcceptedAt:
              now,

            processingStartedAt:
              now,

            processingDeadline:
              deadline,
          },
        });

      if (
        claimed.count === 0
      ) {
        return NextResponse.json(
          {
            error:
              "This order has already been accepted by another processing staff member.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Order accepted successfully",
      });
    }

    /*
     * ======================================================
     * STEP 2 0 PREPARE & PACK
     * ======================================================
     */

    if (
      action ===
      "prepare"
    ) {
      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
        });

      if (!order) {
        return NextResponse.json(
          {
            error:
              "Order not found",
          },
          { status: 404 }
        );
      }

// A TEMP TEST
// Staff validation bypassed

      const items =
        await prisma.orderItem.findMany({
          where: {
            orderId,
          },
          select: {
            packed: true,
          },
        });

      if (
        items.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "No products found in this order.",
          },
          { status: 400 }
        );
      }

      const allPacked =
        items.every(
          (item) =>
            item.packed
        );

      if (!allPacked) {
        return NextResponse.json(
          { error: "Tick the Packed checkbox for every product before Prepare." },
          { status: 400 }
        );
      }

      if (order.processingAcceptedById !== current.staff.id) {
        return NextResponse.json(
          { error: "Only the staff member who accepted this order can prepare it." },
          { status: 403 }
        );
      }

      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          processingStep:
            2,

          processingPreparedById:
            current.staff.id,

          processingPreparedAt:
            now,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Prepare & Pack completed",
      });
    }

    /*
     * ======================================================
     * STEP 3 0 CROSS CHECK
     * ======================================================
     */

    if (
      action ===
      "crossCheck"
    ) {
      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
        });

      if (!order) {
        return NextResponse.json(
          {
            error:
              "Order not found",
          },
          { status: 404 }
        );
      }

      if (
        order.processingAcceptedById !==
        current.staff.id
      ) {
        return NextResponse.json(
          {
            error:
              "Only the assigned processing staff can complete this order.",
          },
          { status: 403 }
        );
      }

      if (order.processingAcceptedById !== current.staff.id) {
        return NextResponse.json(
          { error: "Only the assigned processing staff can cross-check this order." },
          { status: 403 }
        );
      }

      if ((order.processingStep || 0) < 2) {
        return NextResponse.json(
          { error: "Complete Step 2 Prepare before Cross Check." },
          { status: 400 }
        );
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          processingStep: 3,
          processingCrossCheckedById: current.staff.id,
          processingCrossCheckedAt: now,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cross-check completed",
      });
    }
/*
 * ======================================================
 * STEP 4 - STICKER
 * ======================================================
 */

if (action === "sticker") {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.processingAcceptedById !== current.staff.id) {
    return NextResponse.json({ error: "Only the assigned processing staff can complete Sticker." }, { status: 403 });
  }
  if ((order.processingStep || 0) < 3) {
    return NextResponse.json({ error: "Complete Step 3 Cross Check before Sticker." }, { status: 400 });
  }
  await prisma.order.update({
    where: { id: orderId },
    data: {
      processingStep: 4,
      processingStickerById: current.staff.id,
      processingStickerAt: now,
    },
  });
  return NextResponse.json({ success: true, message: "Sticker completed" });
}

/*
 * ======================================================
 * STEP 5 - PACK
 * ======================================================
 */

if (action === "pack") {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.processingAcceptedById !== current.staff.id) {
    return NextResponse.json({ error: "Only the assigned processing staff can complete Final Packaging." }, { status: 403 });
  }
  if ((order.processingStep || 0) < 4) {
    return NextResponse.json({ error: "Complete Step 4 Sticker before Final Packaging." }, { status: 400 });
  }
  await prisma.order.update({
    where: { id: orderId },
    data: {
      processingStep: 5,
      processingPackagingById: current.staff.id,
      processingPackagingAt: now,
    },
  });
  return NextResponse.json({ success: true, message: "Final packaging completed" });
}

    /*
     * ======================================================
     * STEP 4 0 SEND FOR DISPATCH
     * ======================================================
     */

    if (action === "dispatch") {
      const riderId = Number(body?.riderId || 0);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return NextResponse.json({ error: "Valid order ID required" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      if (order.processingAcceptedById !== current.staff.id) {
        return NextResponse.json({ error: "Only the assigned processing staff can dispatch this order." }, { status: 403 });
      }
      if ((order.processingStep || 0) < 5) {
        return NextResponse.json({ error: "Complete Steps 1–5 before assigning a rider." }, { status: 400 });
      }
      if (!Number.isInteger(riderId) || riderId <= 0) {
        return NextResponse.json({ error: "Select an approved rider before dispatch." }, { status: 400 });
      }

      const rider = await prisma.deliveryBoy.findFirst({
        where: { id: riderId, approvalStatus: "Approved" },
        select: { id: true, name: true },
      });
      if (!rider) {
        return NextResponse.json({ error: "Selected rider is not approved or no longer available." }, { status: 400 });
      }

      const existingAssignment = await prisma.deliveryAssignment.findFirst({
        where: { orderId },
      });
      if (existingAssignment) {
        return NextResponse.json({ error: "This order already has a rider assignment." }, { status: 409 });
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await prisma.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId: rider.id,
          otp,
          status: "Pending Acceptance",
          earnings: 25,
          assignedAt: now,
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "Assigned To Rider",
          deliveryOtp: otp,
          processingStep: 6,
          processingDispatchedById: current.staff.id,
        },
      });

      return NextResponse.json({
        success: true,
        riderId: rider.id,
        riderName: rider.name,
        otp,
        message: "Invoice step completed and order assigned to rider.",
      });
    }

    /*
 * ======================================================
 * PACKING ITEM CHECKBOX
     * ======================================================
     */

    if (
      action ===
      "packItem"
    ) {
      const itemId =
        Number(
          body?.itemId
        );

      const packed =
        body?.packed === true;

      if (
        !Number.isInteger(
          itemId
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Valid item ID required",
          },
          { status: 400 }
        );
      }

      const item =
        await prisma.orderItem.findUnique({
          where: {
            id: itemId,
          },
          select: {
            id: true,
            orderId: true,
          },
        });

      if (!item) {
        return NextResponse.json(
          {
            error:
              "Item not found",
          },
          { status: 404 }
        );
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: item.orderId,
          },
          select: {
            processingAcceptedById:
              true,
          },
        });

      

      await prisma.orderItem.update({
        where: {
          id: itemId,
        },
        data: {
          packed,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "PROCESSING PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Processing action failed",
      },
      { status: 500 }
    );
  }
}
