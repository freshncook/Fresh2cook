import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { customers } from "@/lib/f2c-db";
import { callerOf } from "@/lib/caller";
import { getStoreSettings } from "@/lib/store-settings";
import { readLeads, saveLeads, type ReferralLead } from "@/lib/referral-leads";

export const dynamic = "force-dynamic";

/*
 * POST  (customer login)  { friendName, friendMobile, pincode }  -> save a referral
 * GET   (admin)           -> all referrals with live status
 * PATCH (admin)           { id, remove: true } | { id, note }
 */

const clean10 = (v: unknown) => String(v || "").replace(/\D/g, "").slice(-10);

export async function POST(req: Request) {
  const who = callerOf(req);
  if (who.kind !== "customer") return NextResponse.json({ success: false, error: "Please log in to refer a friend.", login: true }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const friendName = String(body?.friendName || "").replace(/\s+/g, " ").trim().slice(0, 60);
  const friendMobile = clean10(body?.friendMobile);
  const pincode = String(body?.pincode || "").replace(/\D/g, "").slice(0, 6);

  if (friendName.length < 2) return NextResponse.json({ success: false, error: "Enter your friend's name." }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(friendMobile)) return NextResponse.json({ success: false, error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ success: false, error: "Enter a 6-digit pincode." }, { status: 400 });
  if (friendMobile === who.mobile) return NextResponse.json({ success: false, error: "You cannot refer your own number." }, { status: 400 });

  const me = await customers.byId(who.id).catch(() => null);
  if (!me) return NextResponse.json({ success: false, error: "Please log in again." }, { status: 401 });

  const list = await readLeads();
  const dayAgo = Date.now() - 86400000;
  if (list.filter((l) => l.referrerMobile === who.mobile && l.at > dayAgo).length >= 20) {
    return NextResponse.json({ success: false, error: "You can refer up to 20 friends a day." }, { status: 429 });
  }
  if (list.some((l) => l.friendMobile === friendMobile)) {
    return NextResponse.json({ success: false, error: "This friend has already been referred." }, { status: 409 });
  }
  const [orders, account] = await Promise.all([
    prisma.order.count({ where: { phone: { contains: friendMobile } } }),
    customers.byMobile(friendMobile).catch(() => null),
  ]);
  if (orders > 0 || account) {
    return NextResponse.json({ success: false, error: "This number is already a Fresh2Cook customer." }, { status: 409 });
  }

  const lead: ReferralLead = {
    id: randomBytes(6).toString("hex"),
    at: Date.now(),
    friendName,
    friendMobile,
    pincode,
    referrerName: me.name,
    referrerMobile: me.mobile,
    referrerCode: me.referralCode,
  };
  await saveLeads([...list, lead]);

  const shop = await getStoreSettings();
  const pins: string[] = String(shop.servicePincodes || "").match(/\d{6}/g) || [];
  return NextResponse.json({
    success: true,
    lead: { id: lead.id, friendName, friendMobile, pincode },
    code: me.referralCode,
    servedPincode: !pins.length || pins.includes(pincode),
    welcome: shop.referralWelcome,
    reward: shop.referralReward,
  });
}

export async function GET(req: Request) {
  if (callerOf(req).kind !== "admin") return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const list = await readLeads();
  const phones = list.map((l) => l.friendMobile);
  const safe = phones.length ? phones : ["-"];
  const [refs, orders] = await Promise.all([
    prisma.referral.findMany({ where: { referredPhone: { in: safe } } }),
    prisma.order.findMany({ where: { phone: { in: safe } }, select: { phone: true, status: true } }),
  ]);
  const refBy = new Map(refs.map((r) => [r.referredPhone, r]));
  const leads = list
    .map((l) => {
      const r = refBy.get(l.friendMobile);
      const o = orders.filter((x) => String(x.phone).slice(-10) === l.friendMobile);
      const status = r?.status === "Completed" ? "Reward paid" : r ? "Joined · first order placed" : o.length ? "Ordered" : "Invited";
      return { ...l, status, orders: o.length, earned: r?.status === "Completed" ? r.creditEarned : 0 };
    })
    .sort((a, b) => b.at - a.at);
  return NextResponse.json({
    success: true,
    leads,
    summary: {
      total: leads.length,
      joined: leads.filter((l) => l.status !== "Invited").length,
      paid: leads.filter((l) => l.status === "Reward paid").length,
      rewardPaid: leads.reduce((s, l) => s + Number(l.earned || 0), 0),
    },
  });
}

export async function PATCH(req: Request) {
  if (callerOf(req).kind !== "admin") return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const list = await readLeads();
  const i = list.findIndex((l) => l.id === id);
  if (i < 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (body?.remove) list.splice(i, 1);
  else list[i] = { ...list[i], note: String(body?.note || "").slice(0, 200) };
  await saveLeads(list);
  return NextResponse.json({ success: true });
}
