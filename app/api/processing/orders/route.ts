import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentSession } from "@/lib/auth";
import { getStoreSettings } from "@/lib/store-settings";

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

// Admin (SUPER_ADMIN) can also open and run the Processing Dashboard.
const PROCESSING_ROLES = ["PROCESSING", "SUPER_ADMIN"];

async function getProcessingStaff() {
  const session =
    await getCurrentSession();

  const data =
    session as SessionLike | null;

  if (
    !data ||
    data.kind !== "staff" ||
    !PROCESSING_ROLES.includes(String(data.role).toUpperCase())
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
      PROCESSING_ROLES.includes(String(staff.role).toUpperCase())
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
      PROCESSING_ROLES.includes(String(staff.role).toUpperCase())
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
          role: { in: PROCESSING_ROLES },
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

  // The rider assignment is stored separately from Order, so resolve it here
  // to prevent the UI from displaying "Rider: Name unavailable".
  const assignments = orderIds.length > 0
    ? await prisma.deliveryAssignment.findMany({
        where: { orderId: { in: orderIds } },
        select: { orderId: true, deliveryBoyId: true, assignedAt: true },
        orderBy: { assignedAt: "desc" },
      })
    : [];

  const latestAssignmentByOrder = new Map<number, (typeof assignments)[number]>();
  for (const assignment of assignments) {
    if (!latestAssignmentByOrder.has(assignment.orderId)) {
      latestAssignmentByOrder.set(assignment.orderId, assignment);
    }
  }

  const assignedRiderIds = [...new Set(assignments.map((assignment) => assignment.deliveryBoyId))];
  const assignedRiders = assignedRiderIds.length > 0
    ? await prisma.deliveryBoy.findMany({
        where: { id: { in: assignedRiderIds } },
        select: { id: true, name: true, mobile: true },
      })
    : [];
  const assignedRiderMap = new Map(assignedRiders.map((rider) => [rider.id, rider]));

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
      // The order-line variant is the source of truth for purchased pack size.
      // Fall back to the catalogue default only when the order line has no variant.
      // Use the pack selected on the order line first. This database's current
      // OrderItem model does not persist a variant yet, so apply the explicit
      // sizes requested for these products before the catalogue's 250g default.
      packSize:
        (item as any).packSize ||
        (item as any).pack ||
        (item as any).variantName ||
        (/^aloo$/i.test(String(product?.name || item.productName || "")) ? "1kg" : null) ||
        (/^tomato$/i.test(String(product?.name || item.productName || "")) ? "500g" : null) ||
        (product as any)?.pack ||
        (product as any)?.packSize ||
        "-",
      pack:
        (item as any).packSize ||
        (item as any).pack ||
        (item as any).variantName ||
        (/^aloo$/i.test(String(product?.name || item.productName || "")) ? "1kg" : null) ||
        (/^tomato$/i.test(String(product?.name || item.productName || "")) ? "500g" : null) ||
        (product as any)?.pack ||
        (product as any)?.packSize ||
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

      assignedRiderName: (() => {
        const assignment = latestAssignmentByOrder.get(order.id);
        return assignment
          ? assignedRiderMap.get(assignment.deliveryBoyId)?.name || null
          : null;
      })(),
      riderName: (() => {
        const assignment = latestAssignmentByOrder.get(order.id);
        return assignment
          ? assignedRiderMap.get(assignment.deliveryBoyId)?.name || null
          : null;
      })(),

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
     * STEPS 2–5 — PREPARE, CROSS CHECK, STICKER, FINAL PACK
     * ------------------------------------------------------
     * - The order must be accepted (Step 1) first.
     * - Any active PROCESSING staff can continue the steps;
     *   whoever presses the button is recorded for that step.
     * - Steps must go in order. Pressing an already-completed
     *   step again returns success and never moves the order
     *   backwards.
     * ======================================================
     */

    const STEP_CONFIG: Record<
      string,
      { step: number; label: string; previousLabel: string }
    > = {
      prepare: { step: 2, label: "Prepare", previousLabel: "Step 1 Accept" },
      crossCheck: { step: 3, label: "Cross Check", previousLabel: "Step 2 Prepare" },
      sticker: { step: 4, label: "Sticker", previousLabel: "Step 3 Cross Check" },
      pack: { step: 5, label: "Final Pack", previousLabel: "Step 4 Sticker" },
    };

    if (STEP_CONFIG[action]) {
      const config = STEP_CONFIG[action];

      if (!Number.isInteger(orderId) || orderId <= 0) {
        return NextResponse.json(
          { error: "Valid order ID required" },
          { status: 400 }
        );
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { error: `Order #${orderId} not found` },
          { status: 404 }
        );
      }

      if (TERMINAL_STATUSES.includes(order.status)) {
        return NextResponse.json(
          { error: `Order #${orderId} is already ${order.status}.` },
          { status: 400 }
        );
      }

      if (!order.processingAcceptedById || (order.processingStep || 0) < 1) {
        return NextResponse.json(
          { error: `Press "1 Accept" on Order #${orderId} first.` },
          { status: 400 }
        );
      }

      const currentStep = order.processingStep || 0;

      // Already done — do not move the order backwards.
      if (currentStep >= config.step) {
        return NextResponse.json({
          success: true,
          alreadyDone: true,
          message: `${config.label} was already completed for Order #${orderId}.`,
        });
      }

      if (currentStep < config.step - 1) {
        return NextResponse.json(
          {
            error: `Complete ${config.previousLabel} before ${config.label}.`,
          },
          { status: 400 }
        );
      }

      if (action === "prepare") {
        const items = await prisma.orderItem.findMany({
          where: { orderId },
          select: { packed: true },
        });

        if (items.length === 0) {
          return NextResponse.json(
            { error: "No products found in this order." },
            { status: 400 }
          );
        }

        if (!items.every((item) => item.packed)) {
          return NextResponse.json(
            { error: "Tick the Packed checkbox for every product before Prepare." },
            { status: 400 }
          );
        }
      }

      const data: Prisma.OrderUpdateManyMutationInput = {
        processingStep: config.step,
      };

      if (action === "prepare") {
        data.processingPreparedById = current.staff.id;
        data.processingPreparedAt = now;
      } else if (action === "crossCheck") {
        data.processingCrossCheckedById = current.staff.id;
        data.processingCrossCheckedAt = now;
      } else if (action === "sticker") {
        data.processingStickerById = current.staff.id;
        data.processingStickerAt = now;
      } else if (action === "pack") {
        data.processingPackagingById = current.staff.id;
        data.processingPackagingAt = now;
        data.readyAt = now;
        data.status = "Ready For Dispatch";
      }

      // Guard against two clicks racing: only advance from the expected step.
      const updated = await prisma.order.updateMany({
        where: { id: orderId, processingStep: config.step - 1 },
        data,
      });

      if (updated.count === 0) {
        return NextResponse.json({
          success: true,
          alreadyDone: true,
          message: `${config.label} was already completed for Order #${orderId}.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `${config.label} completed for Order #${orderId}`,
      });
    }

    /*
     * ======================================================
     * STEP 6 — INVOICE + RIDER
     * ======================================================
     */

    if (action === "dispatch") {
      const riderId = Number(body?.riderId || 0);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return NextResponse.json({ error: "Valid order ID required" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return NextResponse.json({ error: `Order #${orderId} not found` }, { status: 404 });
      }
      if (TERMINAL_STATUSES.includes(order.status)) {
        return NextResponse.json(
          { error: `Order #${orderId} is already ${order.status}.` },
          { status: 400 }
        );
      }
      if ((order.processingStep || 0) < 5) {
        return NextResponse.json(
          { error: "Complete Steps 1–5 (up to Final Pack) before assigning a rider." },
          { status: 400 }
        );
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

      // Old rejected / cancelled / failed assignments must not block a new one.
      const activeAssignment = await prisma.deliveryAssignment.findFirst({
        where: {
          orderId,
          status: { notIn: ["Rejected", "Cancelled", "Failed", "Reassigned"] },
        },
        orderBy: { assignedAt: "desc" },
      });

      if (activeAssignment) {
        // Step 6 already went through (e.g. double click or page refresh):
        // make sure the order reflects it and report success instead of an error.
        if ((order.processingStep || 0) < 6) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "Assigned To Rider",
              deliveryOtp: activeAssignment.otp,
              processingStep: 6,
              processingDispatchedById: current.staff.id,
              dispatchedAt: order.dispatchedAt || now,
            },
          });
        }

        const assignedRider = await prisma.deliveryBoy.findUnique({
          where: { id: activeAssignment.deliveryBoyId },
          select: { id: true, name: true },
        });

        return NextResponse.json({
          success: true,
          alreadyDone: true,
          riderId: assignedRider?.id || activeAssignment.deliveryBoyId,
          riderName: assignedRider?.name || null,
          message: `Order #${orderId} is already assigned to ${assignedRider?.name || "a rider"}.`,
        });
      }

      // Keep the OTP the customer already got at checkout (Order.deliveryOtp).
      // Only create a new one if the order never had one.
      const otp =
        order.deliveryOtp && /^\d{4,6}$/.test(order.deliveryOtp)
          ? order.deliveryOtp
          : Math.floor(1000 + Math.random() * 9000).toString();

      // Both writes succeed together or not at all, so a half-done Step 6
      // can never block the next attempt.
      await prisma.$transaction([
        prisma.deliveryAssignment.create({
          data: {
            orderId,
            deliveryBoyId: rider.id,
            otp,
            status: "Pending Acceptance",
            earnings: (await getStoreSettings()).riderCommission,
            assignedAt: now,
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "Assigned To Rider",
            deliveryOtp: otp,
            processingStep: 6,
            processingDispatchedById: current.staff.id,
            dispatchedAt: now,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        riderId: rider.id,
        riderName: rider.name,
        message: `Invoice done and Order #${orderId} assigned to ${rider.name}.`,
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
