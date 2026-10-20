import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { cleanMobile, getCustomerSession } from "@/lib/session-helpers";
import { getStoreSettings } from "@/lib/store-settings";
import { walletSummary } from "@/lib/wallet";
import { REF_COOKIE, cleanCode, joinReferral, makeReferralCode } from "@/lib/referral";
import { loadCustomerOrders } from "@/lib/customer-orders";
import { customers, type CustomerRow } from "@/lib/f2c-db";

export const dynamic = "force-dynamic";

/*
 * Customer account (mobile + password).
 *   GET  -> profile, orders, wallet, referrals  (login required)
 *   POST { action: signup | login | logout | updateProfile | changePassword | reorder }
 */

type Account = CustomerRow;

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function sessionFor(res: NextResponse, a: Account) {
  setSessionCookie(res, { kind: "customer", id: a.id, role: "CUSTOMER", name: a.name, mobile: a.mobile });
}

function maskPhone(p: string) {
  return p.length >= 10 ? `${p.slice(0, 2)}xxxxxx${p.slice(-2)}` : p;
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, loggedIn: false }, { status: 401 });

  let account: Account | null = await customers.byId(Number(session.id));
  if (!account || !account.active) return NextResponse.json({ success: false, loggedIn: false }, { status: 401 });

  // Old random codes (F2Cxxxxx) -> new name+mobile code, if nobody has used the old one yet
  if (/^F2C[0-9A-Z]{5}$/.test(account.referralCode)) {
    const used =
      (await customers.countReferredBy(account.referralCode)) +
      (await prisma.referral.count({ where: { referrerPhone: account.mobile } }));
    if (used === 0) {
      const fresh = await makeReferralCode(account.name, account.mobile, account.id);
      account = (await customers.update(account.id, { referralCode: fresh })) || account;
    }
  }

  const [orders, wallet, referrals, settings] = await Promise.all([
    loadCustomerOrders({ phone: account.mobile }),
    walletSummary(account.mobile),
    prisma.referral.findMany({ where: { referrerPhone: account.mobile }, orderBy: { createdAt: "desc" }, take: 50 }),
    getStoreSettings(),
  ]);

  const delivered = orders.filter((o) => o.status === "Delivered");

  return NextResponse.json({
    success: true,
    loggedIn: true,
    profile: {
      name: account.name,
      mobile: account.mobile,
      email: account.email,
      referralCode: account.referralCode,
      joinedAt: account.createdAt,
    },
    stats: {
      totalOrders: orders.length,
      delivered: delivered.length,
      totalSpent: delivered.reduce((s, o) => s + o.amount, 0),
      activeOrders: orders.filter((o) => o.stage >= 0 && o.stage < 3).length,
    },
    orders,
    wallet: {
      balance: wallet.balance,
      earned: wallet.earned,
      soonExpiring: wallet.soonExpiring,
      transactions: wallet.transactions.slice(0, 30).map((t) => ({
        id: t.id,
        amount: t.credit,
        type: t.type,
        date: t.createdAt,
        expiresAt: t.expiresAt,
      })),
    },
    referral: {
      code: account.referralCode,
      reward: settings.referralReward,
      welcome: settings.referralWelcome,
      friends: referrals.map((r) => ({
        id: r.id,
        friend: maskPhone(r.referredPhone),
        status: r.status,
        earned: r.status === "Completed" ? r.creditEarned : 0,
        date: r.createdAt,
      })),
      totalEarned: referrals.filter((r) => r.status === "Completed").reduce((s, r) => s + Number(r.creditEarned || 0), 0),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      clearSessionCookie(res);
      return res;
    }

    if (action === "signup") {
      const name = String(body?.name || "").trim().slice(0, 80);
      const mobile = cleanMobile(body?.mobile);
      const password = String(body?.password || "");
      const typedCode = cleanCode(body?.referralCode);
      // Invite link (/r/CODE) saved the code in a cookie — apply it automatically
      const cookieCode = cleanCode((await cookies()).get(REF_COOKIE)?.value);
      const code = typedCode || cookieCode;

      if (name.length < 2) return fail("Please enter your name.");
      if (!/^[6-9]\d{9}$/.test(mobile)) return fail("Please enter a valid 10-digit mobile number.");
      if (password.length < 6) return fail("Password must be at least 6 characters.");

      const existing = await customers.byMobile(mobile);
      if (existing) return fail("An account with this mobile already exists. Please log in.", 409);

      let referrer: Account | null = null;
      if (code) {
        referrer = await customers.byReferralCode(code);
        if (!referrer && typedCode) return fail("Invalid referral code. You can leave it blank and still sign up.");
        if (referrer && referrer.mobile === mobile) referrer = null;
      }

      const account = await customers.create({
        name,
        mobile,
        passwordHash: hashPassword(password),
        referralCode: await makeReferralCode(name, mobile),
        referredBy: referrer ? referrer.referralCode : null,
      });
      if (!account) return fail("Account could not be created. Please try again.", 500);

      // Refer & Earn: join the inviter's team (only for genuinely new customers)
      const joinedTeamOf = referrer ? await joinReferral({ phone: mobile, name, code: referrer.referralCode }) : null;

      const res = NextResponse.json({ success: true, name: account.name, mobile: account.mobile, joinedTeamOf });
      sessionFor(res, account);
      res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }

    if (action === "login") {
      const mobile = cleanMobile(body?.mobile);
      const password = String(body?.password || "");
      if (!/^\d{10}$/.test(mobile) || !password) return fail("Enter your mobile number and password.");

      const account: Account | null = await customers.byMobile(mobile);
      if (!account || !account.active || !verifyPassword(password, account.passwordHash)) {
        return fail("Wrong mobile number or password.", 401);
      }
      await customers.update(account.id, { lastLoginAt: Date.now() });
      const res = NextResponse.json({ success: true, name: account.name, mobile: account.mobile });
      sessionFor(res, account);
      return res;
    }

    // ---- actions below need login ----
    const session = await getCustomerSession();
    if (!session) return fail("Please log in again.", 401);
    const account: Account | null = await customers.byId(Number(session.id));
    if (!account) return fail("Please log in again.", 401);

    if (action === "updateProfile") {
      const name = String(body?.name || "").trim().slice(0, 80);
      const email = String(body?.email || "").trim().slice(0, 120);
      if (name.length < 2) return fail("Name must be at least 2 letters.");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Invalid email address.");
      const updated = await customers.update(account.id, { name, email: email || null });
      const res = NextResponse.json({ success: true, message: "Profile saved" });
      if (updated) sessionFor(res, updated);
      return res;
    }

    if (action === "changePassword") {
      const current = String(body?.current || "");
      const next = String(body?.next || "");
      if (!verifyPassword(current, account.passwordHash)) return fail("Current password is wrong.");
      if (next.length < 6) return fail("New password must be at least 6 characters.");
      await customers.update(account.id, { passwordHash: hashPassword(next) });
      return NextResponse.json({ success: true, message: "Password changed" });
    }

    if (action === "reorder") {
      const orderId = Number(body?.orderId);
      const order = await prisma.order.findFirst({ where: { id: orderId, phone: account.mobile }, select: { id: true } });
      if (!order) return fail("Order not found", 404);

      const items = await prisma.orderItem.findMany({ where: { orderId }, select: { productId: true, productName: true, quantity: true, pack: true } });
      const products = await prisma.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
        select: { id: true, name: true, price: true, stock: true, image: true, category: true, active: true, pack: true },
      });
      const pmap = new Map(products.map((p) => [p.id, p]));

      const cart: { id: number; name: string; price: number; mrp: number; pack: string; qty: number; stock: number; image?: string; category?: string }[] = [];
      // Same pack pricing as the Products page: 500g = 2x, 1kg = 4x the base price
      const factor = (pack: string) => (pack === "500g" ? 2 : pack === "1kg" ? 4 : 1);
      const unavailable: string[] = [];
      for (const it of items) {
        const p = pmap.get(it.productId);
        if (!p || !p.active || p.stock <= 0) {
          unavailable.push(it.productName);
          continue;
        }
        const pack = it.pack || p.pack || "Piece";
        const price = p.price * factor(pack);
        cart.push({
          id: p.id,
          name: p.name,
          price,
          mrp: Math.round(price * 1.2),
          pack,
          qty: Math.max(1, Math.min(it.quantity, p.stock)),
          stock: p.stock,
          image: p.image || undefined,
          category: p.category,
        });
      }
      return NextResponse.json({ success: true, cart, unavailable });
    }

    return fail("Invalid action");
  } catch (error) {
    console.error("CUSTOMER ACCOUNT ERROR:", error);
    return fail(error instanceof Error ? error.message : "Something went wrong", 500);
  }
}
