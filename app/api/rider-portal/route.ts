import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getStoreSettings } from "@/lib/store-settings";
import { payReferralOnDelivery } from "@/lib/wallet";
import { riderWallet, setRiderUpi, validUpi } from "@/lib/rider-wallet";
import { missing as kycMissing, readKyc, saveKyc, submitKyc } from "@/lib/kyc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Rider Portal API — one secure endpoint for the rider app.
 *   GET  -> logged-in rider's profile, stats, tasks, history, earnings
 *   POST -> { action, assignmentId?, otp? }
 *           actions: accept | reject | pickup | startDelivery | resendOtp | complete | callCustomer | toggleOnline | logout
 *                    setUpi { upi } | requestPayout
 * Every request checks the f2c_rider_session cookie, and every task action
 * checks that the order really belongs to the logged-in rider.
 */

const IST_OFFSET = 330 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const OTP_RESEND_GAP_MS = 30 * 1000;
// Simple per-server cooldown so OTP is not regenerated again and again.
const lastOtpResend = new Map<number, number>();

const ACTIVE = ["Pending Acceptance", "Accepted", "Picked Up", "Otp Sent", "Out For Delivery"];
const CLOSED = ["Delivered", "Rejected", "Cancelled", "Failed", "Reassigned"];

function istDayStart(date: Date) {
  return new Date(Math.floor((date.getTime() + IST_OFFSET) / DAY) * DAY - IST_OFFSET);
}

function istDayKey(date: Date) {
  return new Date(date.getTime() + IST_OFFSET).toISOString().slice(0, 10);
}

function getRiderId(req: NextRequest): number | null {
  const token = req.cookies.get("f2c_rider_session")?.value;
  const secret = process.env.RIDER_SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const expected = createHmac("sha256", secret).update(parts[0]).digest();
    const supplied = Buffer.from(parts[1], "base64url");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!Number.isInteger(payload.riderId) || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) {
      return null;
    }
    return payload.riderId;
  } catch {
    return null;
  }
}

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/* =====================================================
 * GET — everything the rider page needs in one call
 * ===================================================== */
export async function GET(req: NextRequest) {
  try {
    const riderId = getRiderId(req);
    if (!riderId) return fail("Please log in again", 401);

    const rider = await prisma.deliveryBoy.findUnique({ where: { id: riderId } });
    if (!rider) return fail("Rider account not found", 401);

    const zone = rider.zoneId
      ? await prisma.deliveryZone.findUnique({ where: { id: rider.zoneId }, select: { zoneName: true } })
      : null;

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryBoyId: riderId },
      orderBy: { assignedAt: "desc" },
      take: 200,
    });

    const orderIds = [...new Set(assignments.map((a) => a.orderId))];
    const [orders, items] = await Promise.all([
      prisma.order.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, customer: true, address: true, amount: true, status: true, latitude: true, longitude: true, createdAt: true },
      }),
      prisma.orderItem.findMany({
        where: { orderId: { in: assignments.filter((a) => ACTIVE.includes(a.status)).map((a) => a.orderId) } },
        select: { orderId: true, productName: true, pack: true, quantity: true },
        orderBy: { id: "asc" },
      }),
    ]);

    const orderMap = new Map(orders.map((o) => [o.id, o]));
    const itemsByOrder = new Map<number, { name: string; pack: string | null; qty: number }[]>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push({ name: item.productName, pack: item.pack, qty: item.quantity });
      itemsByOrder.set(item.orderId, list);
    }

    const now = new Date();
    const todayStart = istDayStart(now);
    const weekStart = new Date(todayStart.getTime() - 6 * DAY);
    const monthStart = new Date(todayStart.getTime() - 29 * DAY);

    const delivered = assignments.filter((a) => a.status === "Delivered" && a.deliveredAt);
    const sumEarn = (list: typeof delivered) => list.reduce((s, a) => s + Number(a.earnings || 0), 0);
    const deliveredToday = delivered.filter((a) => a.deliveredAt! >= todayStart);
    const deliveredWeek = delivered.filter((a) => a.deliveredAt! >= weekStart);
    const deliveredMonth = delivered.filter((a) => a.deliveredAt! >= monthStart);

    const onTime = delivered.filter((a) => a.deliveryDeadline && a.deliveredAt! <= a.deliveryDeadline).length;
    const withDeadline = delivered.filter((a) => a.deliveryDeadline).length;

    const days: { date: string; label: string; deliveries: number; earnings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * DAY);
      const key = istDayKey(d);
      const list = delivered.filter((a) => istDayKey(a.deliveredAt!) === key);
      days.push({
        date: key,
        label: i === 0 ? "Today" : new Date(d.getTime() + IST_OFFSET).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", timeZone: "UTC" }),
        deliveries: list.length,
        earnings: sumEarn(list),
      });
    }

    const shape = (a: (typeof assignments)[number]) => {
      const order = orderMap.get(a.orderId);
      return {
        assignmentId: a.id,
        orderId: a.orderId,
        status: a.status,
        assignedAt: a.assignedAt,
        acceptedAt: a.acceptedAt,
        pickedAt: a.pickedAt,
        deliveredAt: a.deliveredAt,
        deliveryDeadline: a.deliveryDeadline,
        earning: Number(a.earnings || 0),
        customer: order?.customer || "Customer",
        phone: null, // customer number is never shown to riders
        address: order?.address || null,
        amount: Number(order?.amount || 0),
        orderStatus: order?.status || null,
        latitude: order?.latitude ?? null,
        longitude: order?.longitude ?? null,
        items: itemsByOrder.get(a.orderId) || [],
      };
    };

    const active = assignments.filter((a) => ACTIVE.includes(a.status)).map(shape);
    // Show newest work first, but keep "to accept" orders at the top.
    active.sort((x, y) => {
      const px = x.status === "Pending Acceptance" ? 0 : 1;
      const py = y.status === "Pending Acceptance" ? 0 : 1;
      return px - py || new Date(y.assignedAt).getTime() - new Date(x.assignedAt).getTime();
    });

    const history = assignments
      .filter((a) => CLOSED.includes(a.status))
      .slice(0, 50)
      .map(shape);

    return NextResponse.json({
      success: true,
      generatedAt: now,
      rider: {
        id: rider.id,
        name: rider.name,
        mobile: rider.mobile,
        vehicle: rider.vehicle,
        status: rider.status,
        approvalStatus: rider.approvalStatus,
        rating: rider.rating,
        completedDeliveries: rider.completedDeliveries,
        totalEarnings: rider.earnings,
        address: rider.address,
        photo: rider.photo,
        zone: zone?.zoneName || null,
        lastSeen: rider.lastSeen,
        joinedAt: rider.createdAt,
        documents: {
          aadhaar: Boolean(rider.aadhaarFront || rider.aadharFile || rider.aadhaar),
          license: Boolean(rider.licenseFile),
          rc: Boolean(rider.rcFile),
          photo: Boolean(rider.photo),
        },
      },
      stats: {
        toAccept: active.filter((t) => t.status === "Pending Acceptance").length,
        inProgress: active.filter((t) => t.status !== "Pending Acceptance").length,
        deliveredToday: deliveredToday.length,
        earningsToday: sumEarn(deliveredToday),
        deliveredWeek: deliveredWeek.length,
        earningsWeek: sumEarn(deliveredWeek),
        deliveredMonth: deliveredMonth.length,
        earningsMonth: sumEarn(deliveredMonth),
        onTimeRate: withDeadline ? Math.round((onTime / withDeadline) * 100) : null,
        rejected: assignments.filter((a) => a.status === "Rejected").length,
      },
      days,
      active,
      history,
      wallet: await riderWallet(riderId).catch(() => null),
      kyc: await readKyc("rider", riderId)
        .then((k) => ({ ...k, missing: kycMissing("rider", k) }))
        .catch(() => null),
    });
  } catch (error) {
    console.error("RIDER PORTAL GET ERROR:", error);
    return fail(error instanceof Error ? error.message : "Could not load rider data", 500);
  }
}

/* =====================================================
 * POST — rider actions
 * ===================================================== */
export async function POST(req: NextRequest) {
  try {
    const riderId = getRiderId(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.set("f2c_rider_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    if (!riderId) return fail("Please log in again", 401);

    if (action === "kyc") {
      await saveKyc("rider", riderId, (body?.data || {}) as Record<string, unknown>);
      return NextResponse.json({ success: true, message: "Saved" });
    }

    if (action === "submitKyc") {
      const r = await submitKyc("rider", riderId);
      if (!r.ok) return fail(`Please add: ${r.missing.join(", ")}`);
      return NextResponse.json({ success: true, message: "Sent to admin for approval" });
    }

    if (action === "setUpi") {
      const upi = String(body?.upi || "").trim();
      if (upi && !validUpi(upi)) return fail("Enter a valid UPI ID, e.g. name@okaxis");
      await setRiderUpi(riderId, upi);
      return NextResponse.json({ success: true, message: upi ? "UPI ID saved" : "UPI ID removed" });
    }

    if (action === "requestPayout") {
      const w = await riderWallet(riderId);
      if (!w.upi) return fail("Add your UPI ID first");
      const amount = w.balance - w.pending;
      if (amount <= 0) return fail("No balance to withdraw");
      await prisma.riderPayout.create({ data: { riderId, amount, status: "Pending" } });
      return NextResponse.json({ success: true, message: `Payout of ₹${amount} requested` });
    }

    const rider = await prisma.deliveryBoy.findUnique({
      where: { id: riderId },
      select: { id: true, approvalStatus: true, status: true },
    });
    if (!rider) return fail("Rider account not found", 401);
    if (rider.approvalStatus !== "Approved") return fail("Your account is not approved yet.", 403);

    const now = new Date();

    if (action === "toggleOnline") {
      const goOnline = body?.online === true;
      if (!goOnline) {
        const busy = await prisma.deliveryAssignment.count({
          where: { deliveryBoyId: riderId, status: { in: ACTIVE.filter((s) => s !== "Pending Acceptance") } },
        });
        if (busy > 0) return fail("Finish your current delivery before going offline.");
      }
      await prisma.deliveryBoy.update({
        where: { id: riderId },
        data: { status: goOnline ? "Available" : "Offline", lastSeen: now },
      });
      return NextResponse.json({ success: true, message: goOnline ? "You are online" : "You are offline" });
    }

    const assignmentId = Number(body?.assignmentId);
    if (!Number.isInteger(assignmentId) || assignmentId <= 0) return fail("Valid assignment ID required");

    const assignment = await prisma.deliveryAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return fail("Order not found", 404);
    if (assignment.deliveryBoyId !== riderId) return fail("This order is not assigned to you", 403);

    const otherActive = () =>
      prisma.deliveryAssignment.count({
        where: { deliveryBoyId: riderId, id: { not: assignmentId }, status: { in: ACTIVE } },
      });

    // Only move forward from the expected status (protects against double taps).
    const move = async (from: string[], data: Prisma.DeliveryAssignmentUpdateManyMutationInput) => {
      const result = await prisma.deliveryAssignment.updateMany({
        where: { id: assignmentId, deliveryBoyId: riderId, status: { in: from } },
        data,
      });
      return result.count === 1;
    };

    // Call the customer: the number is never shown on screen, the phone dialer opens directly.
    // Allowed only for this rider's own order, while it is being delivered.
    if (action === "callCustomer") {
      if (!["Accepted", "Picked Up", "Otp Sent", "Out For Delivery"].includes(assignment.status)) {
        return fail("Calling is available only while you are delivering this order.", 409);
      }
      const order = await prisma.order.findUnique({ where: { id: assignment.orderId }, select: { phone: true } });
      const digits = String(order?.phone || "").replace(/\D/g, "").slice(-10);
      if (digits.length !== 10) return fail("Customer number is not available. Call support.", 404);
      return NextResponse.json({ success: true, tel: "+91" + digits }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "accept") {
      if (!(await move(["Pending Acceptance"], { status: "Accepted", acceptedAt: now }))) {
        return fail("This order was already accepted or changed. Refresh.", 409);
      }
      await prisma.deliveryBoy.update({ where: { id: riderId }, data: { status: "Busy", lastSeen: now } });
      return NextResponse.json({ success: true, message: `Order #${assignment.orderId} accepted` });
    }

    if (action === "reject") {
      if (!(await move(["Pending Acceptance"], { status: "Rejected" }))) {
        return fail("This order can no longer be rejected. Refresh.", 409);
      }
      // Send the order back to processing so another rider can be assigned.
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: "Ready For Dispatch", processingStep: 5, deliveryOtp: null },
      });
      await prisma.deliveryBoy.update({
        where: { id: riderId },
        data: { status: (await otherActive()) > 0 ? "Busy" : "Available", lastSeen: now },
      });
      return NextResponse.json({ success: true, message: `Order #${assignment.orderId} rejected` });
    }

    if (action === "pickup") {
      if (!(await move(["Accepted"], { status: "Picked Up", pickedAt: now }))) {
        return fail("Accept the order before pickup.", 409);
      }
      await prisma.order.update({ where: { id: assignment.orderId }, data: { status: "Picked Up" } });
      return NextResponse.json({ success: true, message: `Order #${assignment.orderId} picked up` });
    }

    if (action === "startDelivery") {
      // Keep the OTP the customer already has; create one only if missing.
      const otp = assignment.otp && /^\d{4,6}$/.test(assignment.otp)
        ? assignment.otp
        : Math.floor(1000 + Math.random() * 9000).toString();
      if (!(await move(["Picked Up", "Otp Sent"], { status: "Otp Sent", otp }))) {
        return fail("Pick up the order before starting delivery.", 409);
      }
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: "Out For Delivery", deliveryOtp: otp },
      });
      return NextResponse.json({
        success: true,
        message: "Delivery started. Ask the customer for the OTP at the door.",
      });
    }

    if (action === "resendOtp") {
      if (!["Otp Sent", "Out For Delivery"].includes(assignment.status)) {
        return fail("Start the delivery first.", 409);
      }
      const last = lastOtpResend.get(assignmentId) || 0;
      const wait = Math.ceil((last + OTP_RESEND_GAP_MS - Date.now()) / 1000);
      if (wait > 0) return fail(`Please wait ${wait} sec before sending OTP again.`, 429);

      // New OTP: old one stops working. The rider never sees the OTP.
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      if (!(await move(["Otp Sent", "Out For Delivery"], { status: "Otp Sent", otp }))) {
        return fail("This delivery has changed. Refresh.", 409);
      }
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { deliveryOtp: otp, status: "Out For Delivery" },
      });
      lastOtpResend.set(assignmentId, Date.now());

      // Hook for SMS / WhatsApp: when a provider is connected, send `otp` to the
      // customer's phone here. Until then the customer sees it on Track Order.
      return NextResponse.json({
        success: true,
        cooldown: OTP_RESEND_GAP_MS / 1000,
        message: "New OTP sent. Customer can see it on their Track Order page.",
      });
    }

    if (action === "complete") {
      const otp = String(body?.otp || "").trim();
      if (!otp) return fail("Enter the customer's OTP.");
      if (!["Otp Sent", "Out For Delivery"].includes(assignment.status)) {
        return fail("Start the delivery first.", 409);
      }
      if (assignment.otp !== otp) return fail("Wrong OTP. Ask the customer again.");

      // Commission: amount fixed when the order was assigned, else today's admin setting.
      const earning =
        Number(assignment.earnings) > 0 ? Number(assignment.earnings) : (await getStoreSettings()).riderCommission;

      if (!(await move(["Otp Sent", "Out For Delivery"], { status: "Delivered", deliveredAt: now, earnings: earning }))) {
        return fail("This delivery was already completed.", 409);
      }
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: "Delivered", deliveryOtp: null },
      });
      await prisma.deliveryBoy.update({
        where: { id: riderId },
        data: {
          status: (await otherActive()) > 0 ? "Busy" : "Available",
          completedDeliveries: { increment: 1 },
          earnings: { increment: earning },
          lastSeen: now,
        },
      });
      await payReferralOnDelivery(assignment.orderId);

      return NextResponse.json({
        success: true,
        message: `Order #${assignment.orderId} delivered. ₹${earning} added to your earnings.`,
      });
    }

    return fail("Invalid action");
  } catch (error) {
    console.error("RIDER PORTAL POST ERROR:", error);
    return fail(error instanceof Error ? error.message : "Action failed", 500);
  }
}
