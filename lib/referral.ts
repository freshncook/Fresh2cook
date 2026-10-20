import { prisma } from "@/lib/prisma";
import { customers } from "@/lib/f2c-db";
import { getStoreSettings } from "@/lib/store-settings";
import { addWalletCredit } from "@/lib/wallet";

/*
 * Refer & Earn helpers.
 *  - Code format: first 3 letters of name + first 3 digits of mobile, e.g. BAL999
 *    (a number is added at the end if that code is already taken: BAL9992)
 *  - Invite link: /r/BAL999 — saves the code for 30 days, so whoever signs up
 *    or orders from that phone joins the inviter's team automatically.
 */

export const REF_COOKIE = "f2c_ref";

export function referralBase(name: string, mobile: string) {
  const letters = (String(name || "").toUpperCase().replace(/[^A-Z]/g, "") + "XXX").slice(0, 3);
  const digits = (String(mobile || "").replace(/\D/g, "").slice(-10) + "000").slice(0, 3);
  return letters + digits;
}

export async function makeReferralCode(name: string, mobile: string, ownId?: number) {
  const base = referralBase(name, mobile);
  for (let i = 0; i < 50; i++) {
    const code = i === 0 ? base : `${base}${i + 1}`;
    const taken = await customers.byReferralCode(code);
    if (!taken || taken.id === ownId) return code;
  }
  return `${base}${Date.now().toString().slice(-4)}`;
}

export function cleanCode(value: unknown) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

/**
 * Join a new customer (by phone) to the inviter's team.
 * Only for genuinely new customers (no earlier orders before `allowOrders`)
 * and only once per phone. Gives the welcome bonus to the new customer.
 * Returns the inviter's name when joined.
 */
export async function joinReferral(opts: { phone: string; name: string; code: string; allowOrders?: number }) {
  const code = cleanCode(opts.code);
  const phone = String(opts.phone || "").replace(/\D/g, "").slice(-10);
  if (!code || !/^\d{10}$/.test(phone)) return null;

  const referrer = await customers.byReferralCode(code);
  if (!referrer || referrer.mobile === phone) return null;

  const [orders, already] = await Promise.all([
    prisma.order.count({ where: { phone } }),
    prisma.referral.count({ where: { referredPhone: phone } }),
  ]);
  if (already > 0 || orders > (opts.allowOrders ?? 0)) return null;

  const settings = await getStoreSettings();
  await prisma.referral.create({
    data: {
      referrerName: referrer.name,
      referrerPhone: referrer.mobile,
      referredPhone: phone,
      orderAmount: 0,
      creditEarned: 0,
      status: "Pending",
    },
  });
  await addWalletCredit({
    customer: opts.name || "Customer",
    phone,
    amount: settings.referralWelcome,
    type: `Welcome bonus — ${referrer.name.split(" ")[0]}'s team (${code})`,
  });
  return referrer.name;
}

/** Ready-to-send invite message (Hinglish) */
export function inviteMessage(opts: { name: string; code: string; origin: string; welcome: number; reward: number }) {
  const first = String(opts.name || "").split(" ")[0] || "Main";
  return [
    "🥬 Fresh2Cook — fresh vegetables, fruits & ready-to-cook, delivered to your door!",
    "",
    `Mera referral code: *${opts.code}*`,
    `Join with this link and get ₹${opts.welcome} in your wallet instantly 👇`,
    `${opts.origin}/r/${opts.code}`,
    "",
    `I'll also get ₹${opts.reward} when you place your first order 🙏`,
    `— ${first}`,
  ].join("\n");
}
