import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { authSecret, verifyAuthToken } from "@/lib/session-verify";

const AUTH_COOKIE = "fresh2cook_session";

type SessionPayload = {
  kind: "staff" | "customer" | "rider";
  id: number;
  role: string;
  name: string;
  mobile: string;
  iat: number;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(value: string) {
  // Live server: FRESH2COOK_AUTH_SECRET must be set in .env (the AutoFix script adds it)
  const secret = authSecret();
  if (!secret) throw new Error("FRESH2COOK_AUTH_SECRET is missing in .env - run the AutoFix script again, then restart.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored) return false;

  if (!stored.startsWith("scrypt$")) {
    return stored === password;
  }

  const [, salt, expectedHex] = stored.split("$");
  if (!salt || !expectedHex) return false;

  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");

    return (
      actual.length === expected.length &&
      timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export function createSessionToken(payload: Omit<SessionPayload, "iat">) {
  const body = encode(
    JSON.stringify({
      ...payload,
      iat: Date.now(),
    })
  );

  return `${body}.${signature(body)}`;
}

export function readSessionToken(token: string | undefined) {
  // signature + 30 day expiry check (same rule as middleware.ts)
  return verifyAuthToken(token) as SessionPayload | null;
}

export function setSessionCookie(
  response: NextResponse,
  payload: Omit<SessionPayload, "iat">
) {
  response.cookies.set(AUTH_COOKIE, createSessionToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(AUTH_COOKIE)?.value);
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;





