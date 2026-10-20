
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getAuthenticatedRiderId(req: NextRequest): number | null {
  const token = req.cookies.get("f2c_rider_session")?.value;
  const secret = process.env.RIDER_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const expected = createHmac("sha256", secret)
      .update(parts[0])
      .digest();

    const supplied = Buffer.from(parts[1], "base64url");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    );

    if (
      !Number.isInteger(payload.riderId) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return payload.riderId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const riderId = getAuthenticatedRiderId(req);

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: "Please log in again" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const assignmentId = Number(body.assignmentId);
    const action = body.action;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID required" },
        { status: 400 }
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const rider = await prisma.deliveryBoy.findUnique({
      where: { id: riderId },
      select: { id: true, approvalStatus: true },
    });

    if (!rider || rider.approvalStatus !== "Approved") {
      return NextResponse.json(
        { success: false, error: "Rider is not approved" },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        return { error: "Assignment not found", status: 404 };
      }

      if (assignment.deliveryBoyId !== riderId) {
        return { error: "This order is not assigned to you", status: 403 };
      }

      if (assignment.status !== "Pending Acceptance") {
        return {
          error: "This assignment has already been processed",
          status: 409,
        };
      }

      const updatedCount = await tx.deliveryAssignment.updateMany({
        where: {
          id: assignmentId,
          deliveryBoyId: riderId,
          status: "Pending Acceptance",
        },
        data:
          action === "accept"
            ? { status: "Accepted", acceptedAt: new Date() }
            : { status: "Rejected" },
      });

      if (updatedCount.count !== 1) {
        return { error: "Assignment changed. Refresh and try again.", status: 409 };
      }

      if (action === "accept") {
        await tx.deliveryBoy.update({
          where: { id: riderId },
          data: { status: "Busy" },
        });
      } else {
        const otherActive = await tx.deliveryAssignment.count({
          where: {
            deliveryBoyId: riderId,
            id: { not: assignmentId },
            status: {
              in: ["Pending Acceptance", "Accepted", "Picked Up", "Out For Delivery"],
            },
          },
        });

        await tx.deliveryBoy.update({
          where: { id: riderId },
          data: { status: otherActive > 0 ? "Busy" : "Available" },
        });
      }

      return {
        success: true,
        message: action === "accept" ? "Order Accepted" : "Order Rejected",
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELIVERY ACCEPT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
