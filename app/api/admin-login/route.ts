import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { cleanMobile, getAdminSession } from "@/lib/session-helpers";

export const dynamic = "force-dynamic";

/*
 * Admin login (StaffUser with role SUPER_ADMIN).
 *   GET  -> { hasAdmin, loggedIn, admin }
 *   POST { mobile, password }                  -> login
 *   POST { action: "setup", name, mobile, password } -> create FIRST admin (only when none exists)
 *   POST { action: "logout" }
 */

const ROLE = "SUPER_ADMIN";

export async function GET() {
  const [count, session] = await Promise.all([
    prisma.staffUser.count({ where: { role: ROLE } }),
    getAdminSession(),
  ]);
  return NextResponse.json({
    success: true,
    hasAdmin: count > 0,
    loggedIn: Boolean(session),
    admin: session ? { name: session.name, mobile: session.mobile } : null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "login");

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      clearSessionCookie(res);
      return res;
    }

    const mobile = cleanMobile(body?.mobile);
    const password = String(body?.password || "");

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ success: false, error: "Enter your password." }, { status: 400 });
    }

    if (action === "setup") {
      const name = String(body?.name || "").trim();
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
      }
      if (name.length < 2) {
        return NextResponse.json({ success: false, error: "Enter your name." }, { status: 400 });
      }
      const existingAdmins = await prisma.staffUser.count({ where: { role: ROLE } });
      if (existingAdmins > 0) {
        return NextResponse.json({ success: false, error: "Admin account already exists. Please log in." }, { status: 409 });
      }
      const taken = await prisma.staffUser.findUnique({ where: { mobile } });
      if (taken) {
        return NextResponse.json({ success: false, error: "This mobile number is already used by another staff account." }, { status: 409 });
      }
      const staff = await prisma.staffUser.create({
        data: { name, mobile, passwordHash: hashPassword(password), role: ROLE },
      });
      const res = NextResponse.json({ success: true, redirectTo: "/admin" });
      setSessionCookie(res, { kind: "staff", id: staff.id, role: staff.role, name: staff.name, mobile: staff.mobile });
      return res;
    }

    const staff = await prisma.staffUser.findFirst({ where: { mobile, role: ROLE, active: true } });
    if (!staff || !verifyPassword(password, staff.passwordHash)) {
      return NextResponse.json({ success: false, error: "Wrong mobile number or password." }, { status: 401 });
    }

    // Upgrade any old plain-text password to a secure hash.
    if (!staff.passwordHash.startsWith("scrypt$")) {
      await prisma.staffUser.update({ where: { id: staff.id }, data: { passwordHash: hashPassword(password) } });
    }

    const res = NextResponse.json({ success: true, redirectTo: "/admin" });
    setSessionCookie(res, { kind: "staff", id: staff.id, role: staff.role, name: staff.name, mobile: staff.mobile });
    return res;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return NextResponse.json({ success: false, error: "Login failed. Please try again." }, { status: 500 });
  }
}
