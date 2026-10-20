import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

const ALLOWED_ROLES = ["SUPER_ADMIN", "PROCESSING"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mobile = String(body?.mobile || "").replace(/\D/g, "");
    const password = String(body?.password || "");
    const role = String(body?.role || "") as AllowedRole;

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff role.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    const staff = await prisma.staffUser.findFirst({
      where: {
        mobile,
        role,
        active: true,
      },
    });

    if (!staff) {
      const count = await prisma.staffUser.count({
        where: { role },
      });

      return NextResponse.json(
        {
          success: false,
          code: count === 0 ? "NO_ACCOUNT" : "INVALID_LOGIN",
          message:
            count === 0
              ? "No account exists for this role yet. Create the first account."
              : "Invalid mobile number or password.",
        },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, staff.passwordHash)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile number or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      role: staff.role,
      staff: {
        id: staff.id,
        name: staff.name,
        mobile: staff.mobile,
      },
    });

    setSessionCookie(response, {
      kind: "staff",
      id: staff.id,
      role: staff.role,
      name: staff.name,
      mobile: staff.mobile,
    });

    return response;
  } catch (error) {
    console.error("STAFF LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed.",
      },
      { status: 500 }
    );
  }
}






