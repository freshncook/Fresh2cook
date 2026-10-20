import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { whoIs } from "@/lib/session-verify";

/*
 * Fresh2Cook security guard — runs before every /api call and every admin page.
 *
 *   PUBLIC     : shop data, login / sign-up, placing an order
 *   CUSTOMER   : own orders, addresses, wallet (customer login)
 *   RIDER      : rider app APIs (rider login)
 *   PROCESSING : processing dashboard APIs (staff login)
 *   ADMIN      : everything else (admin login)
 *
 * Anything not listed below is ADMIN only, so an old or forgotten API can never leak data.
 */

export const config = {
  runtime: "nodejs",
  matcher: ["/api/:path*", "/admin/:path*", "/processing/:path*", "/uploads/:path*", "/order-tracking"],
};

type Rule = { path: string; prefix?: boolean; methods?: string[] };

const R = (path: string, methods?: string[], prefix = false): Rule => ({ path, methods, prefix });

/* Anyone (no login) */
const PUBLIC: Rule[] = [
  R("/api/admin-login"),
  R("/api/auth/staff-login"),
  R("/api/auth/staff-setup"), // only creates the FIRST account of a role
  R("/api/auth/logout"),
  R("/api/customer-account"),
  R("/api/rider-login"),
  R("/api/rider-register"),
  R("/api/rider-session"),
  R("/api/rider-forgot-password"),
  R("/api/delivery-login"),
  R("/api/delivery-register"),
  R("/api/pincode-check"),
  R("/api/home-data"),
  R("/api/referral"),
  R("/api/track-order"),
  R("/api/orders", ["POST"]), // place an order (prices are re-checked on the server)
  R("/api/leads", ["POST"]), // enquiry form
  R("/api/products", ["GET"], true),
  R("/api/store-settings", ["GET"]),
  R("/api/category-images", ["GET"]),
  R("/api/categories", ["GET"]),
  R("/api/public-file/", ["GET"], true), // product pictures
];

/* Logged-in customer (staff may also use them) */
const CUSTOMER: Rule[] = [
  R("/api/customer-addresses", undefined, true),
  R("/api/customer-orders"),
  R("/api/orders/cancel"),
  R("/api/orders/reorder"),
  R("/api/wallet/redeem"),
  R("/api/customer-tracking"),
  R("/api/customer-vip"),
  R("/api/customer-loyalty"),
  R("/api/customer-rewards"),
  R("/api/customer-growth-ai"),
  R("/api/frequently-bought-together"),
  R("/api/referral-leads", ["POST"]), // refer-a-friend popup
];

/* Logged-in rider (admin may also use them) */
const RIDER: Rule[] = [
  "rider-portal", "rider-my-tasks", "rider-dashboard", "rider-accept-order", "rider-pickup-order",
  "delivery-accept", "delivery-accept-order", "rider-location-update", "rider-status", "rider-toggle-status",
  "rider-start-delivery", "rider-complete-delivery", "rider-verify-otp", "rider-complete-order",
  "rider-shift", "rider-attendance", "rider-timeline", "rider-notifications", "rider-performance",
  "rider-incentives", "rider-leaderboard", "rider-activity-log", "rider-wallet-summary", "rider-profile",
].map((n) => R("/api/" + n));

/* Processing staff (admin may also use them) */
const PROCESSING: Rule[] = [R("/api/processing/", undefined, true)];

/* Any logged-in staff or rider */
const ANY_WORKER: Rule[] = [R("/api/upload-file"), R("/api/private-file/", ["GET"], true)];

/* Old pages that no longer work -> send to the new ones */
const OLD_PAGES: Record<string, string> = {
  "/order-tracking": "/track-order",
  "/admin/analytics-v3": "/admin/analytics",
  "/admin/analytics-v4": "/admin/analytics",
  "/admin/real-analytics": "/admin/analytics",
  "/admin/assign-orders": "/admin/orders",
  "/admin/production-center": "/admin",
  "/admin/delivery-live": "/admin",
  "/admin/profit-loss": "/admin/finance",
};

/* Login pages that must stay open */
const OPEN_PAGES = ["/admin/login", "/processing/login"];

function matches(rules: Rule[], path: string, method: string) {
  return rules.some((r) => (r.prefix ? path.startsWith(r.path) : path === r.path || path === r.path + "/") && (!r.methods || r.methods.includes(method)));
}

/* ---------- small in-memory rate limit (logins, orders) ---------- */
type Hit = { count: number; until: number };
const g = globalThis as unknown as { __f2cHits?: Map<string, Hit> };
const hits = (g.__f2cHits ||= new Map<string, Hit>());

const LIMITS: { path: string; max: number; windowMs: number }[] = [
  { path: "/api/admin-login", max: 10, windowMs: 10 * 60_000 },
  { path: "/api/auth/staff-login", max: 10, windowMs: 10 * 60_000 },
  { path: "/api/auth/staff-setup", max: 5, windowMs: 10 * 60_000 },
  { path: "/api/customer-account", max: 20, windowMs: 10 * 60_000 },
  { path: "/api/rider-login", max: 10, windowMs: 10 * 60_000 },
  { path: "/api/delivery-login", max: 10, windowMs: 10 * 60_000 },
  { path: "/api/rider-forgot-password", max: 3, windowMs: 30 * 60_000 },
  { path: "/api/rider-register", max: 5, windowMs: 30 * 60_000 },
  { path: "/api/orders", max: 15, windowMs: 10 * 60_000 },
  { path: "/api/leads", max: 10, windowMs: 10 * 60_000 },
  { path: "/api/rider-complete-delivery", max: 12, windowMs: 10 * 60_000 }, // OTP guessing
  { path: "/api/rider-verify-otp", max: 12, windowMs: 10 * 60_000 },
  { path: "/api/upload-file", max: 60, windowMs: 10 * 60_000 },
];

function limited(req: NextRequest, path: string) {
  if (req.method === "GET") return false;
  const rule = LIMITS.find((l) => l.path === path);
  if (!rule) return false;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${rule.path}|${ip}`;
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.until < now) {
    hits.set(key, { count: 1, until: now + rule.windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.until < now) hits.delete(k);
    return false;
  }
  cur.count++;
  return cur.count > rule.max;
}

function deny(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

const SAFE_UPLOAD = /\.(jpe?g|png|webp|gif|avif|pdf)$/i;

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const method = req.method.toUpperCase();
  const who = whoIs(req.cookies);

  /* ----- uploaded files: only pictures / PDF, never html, svg, js ----- */
  if (path.startsWith("/uploads/")) {
    if (!SAFE_UPLOAD.test(path)) return new NextResponse("Not found", { status: 404 });
    // pictures uploaded after the build are served by /api/public-file
    const rest = path.slice("/uploads/".length);
    if (!rest || rest.split("/").some((p) => !p || p === "." || p === "..")) return new NextResponse("Not found", { status: 404 });
    return NextResponse.rewrite(new URL("/api/public-file/" + rest, req.url));
  }

  /* ----- pages ----- */
  if (!path.startsWith("/api/")) {
    const moved = OLD_PAGES[path.replace(/\/$/, "")];
    if (moved) return NextResponse.redirect(new URL(moved, req.url));
    if (OPEN_PAGES.some((p) => path === p || path.startsWith(p + "/"))) return NextResponse.next();
    if (path.startsWith("/admin") && !who.admin) {
      const to = new URL("/admin/login", req.url);
      to.searchParams.set("next", path + url.search);
      return NextResponse.redirect(to);
    }
    if (path.startsWith("/processing") && !who.staff) {
      return NextResponse.redirect(new URL("/processing/login", req.url));
    }
    const res = NextResponse.next();
    res.headers.set("X-App-Name", "Fresh2Cook");
    return res;
  }

  /* ----- APIs ----- */

  // Block form posts from other websites
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = req.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.get("host")) return deny(403, "Request blocked");
      } catch {
        return deny(403, "Request blocked");
      }
    }
  }

  if (limited(req, path)) return deny(429, "Too many tries. Please wait a few minutes and try again.");

  // Pass the checked identity to the API (anything the browser sent with these names is removed)
  const headers = new Headers(req.headers);
  for (const h of ["x-f2c-kind", "x-f2c-id", "x-f2c-mobile", "x-f2c-role"]) headers.delete(h);
  const tell = (kind: string, id: number, mobile = "", role = "") => {
    headers.set("x-f2c-kind", kind);
    headers.set("x-f2c-id", String(id));
    headers.set("x-f2c-mobile", String(mobile).replace(/\D/g, "").slice(-10));
    headers.set("x-f2c-role", role);
  };
  if (who.admin) tell("admin", who.admin.id, who.admin.mobile, "SUPER_ADMIN");
  else if (who.staff) tell("staff", who.staff.id, who.staff.mobile, String(who.staff.role));
  else if (who.customer) tell("customer", who.customer.id, who.customer.mobile, "CUSTOMER");
  else if (who.rider) tell("rider", who.rider.riderId);

  const pass = (rewrite?: URL) =>
    rewrite ? NextResponse.rewrite(rewrite, { request: { headers } }) : NextResponse.next({ request: { headers } });

  // Admin can use every API
  if (who.admin) return pass();

  if (matches(PUBLIC, path, method)) return pass();

  if (matches(CUSTOMER, path, method)) {
    if (who.staff) return pass();
    if (!who.customer) return deny(401, "Please log in to continue.");
    // a customer only ever sees their own phone number's data
    if (url.searchParams.has("phone") || url.searchParams.has("mobile")) {
      const u = url.clone();
      if (u.searchParams.has("phone")) u.searchParams.set("phone", headers.get("x-f2c-mobile") || "");
      if (u.searchParams.has("mobile")) u.searchParams.set("mobile", headers.get("x-f2c-mobile") || "");
      return pass(u);
    }
    return pass();
  }

  if (matches(RIDER, path, method)) {
    if (!who.rider) return deny(401, "Rider login required.");
    // a rider only ever sees their own data
    if (url.searchParams.has("riderId")) {
      const u = url.clone();
      u.searchParams.set("riderId", String(who.rider.riderId));
      return pass(u);
    }
    return pass();
  }

  if (matches(PROCESSING, path, method)) {
    if (!who.staff) return deny(401, "Staff login required.");
    return pass();
  }

  if (matches(ANY_WORKER, path, method)) {
    if (!who.staff && !who.rider) return deny(401, "Please log in to upload.");
    return pass();
  }

  // Everything else: admin only
  return deny(who.staff || who.customer || who.rider ? 403 : 401, "Admin login required.");
}
