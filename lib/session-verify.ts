import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Checks the two login cookies without touching the database.
 *   fresh2cook_session  -> admin / processing staff / customer  (lib/auth.ts makes it)
 *   f2c_rider_session   -> rider                                   (api/rider-login makes it)
 * Used by middleware.ts (guards every /api call) and by the private file route.
 */

export const AUTH_COOKIE = "fresh2cook_session";
export const RIDER_COOKIE = "f2c_rider_session";

const DEV_SECRET = "fresh2cook-local-auth-secret-change-me";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // same as the cookie

export type StaffOrCustomer = {
  kind: "staff" | "customer" | "rider";
  id: number;
  role: string;
  name: string;
  mobile: string;
  iat: number;
};

/** Secret for fresh2cook_session. On the live server it must come from .env */
export function authSecret(): string | null {
  const s = process.env.FRESH2COOK_AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") return null; // never sign with the public default
  return s || DEV_SECRET;
}

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function verifyAuthToken(token: string | undefined | null): StaffOrCustomer | null {
  if (!token) return null;
  const secret = authSecret();
  if (!secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!sameText(sig, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as StaffOrCustomer;
    if (!p?.id || !p?.role || !p?.kind) return null;
    if (p.iat && Date.now() - Number(p.iat) > MAX_AGE_MS) return null;
    return p;
  } catch {
    return null;
  }
}

export function verifyRiderToken(token: string | undefined | null): { riderId: number } | null {
  if (!token) return null;
  const secret = process.env.RIDER_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = createHmac("sha256", secret).update(parts[0]).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(parts[1], "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const riderId = Number(p?.riderId);
    if (!riderId || (p?.exp && Number(p.exp) < Date.now())) return null;
    return { riderId };
  } catch {
    return null;
  }
}

type CookieJar = { get(name: string): { value: string } | undefined };

/** Who is calling? (reads both cookies) */
export function whoIs(cookies: CookieJar) {
  const main = verifyAuthToken(cookies.get(AUTH_COOKIE)?.value);
  const rider = verifyRiderToken(cookies.get(RIDER_COOKIE)?.value);
  const staff = main && main.kind === "staff" ? main : null;
  return {
    staff,
    admin: staff && String(staff.role).toUpperCase() === "SUPER_ADMIN" ? staff : null,
    customer: main && main.kind === "customer" ? main : null,
    rider,
  };
}
