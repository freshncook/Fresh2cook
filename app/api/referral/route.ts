import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { customers } from "@/lib/f2c-db";
import { getStoreSettings } from "@/lib/store-settings";
import { REF_COOKIE, cleanCode, joinReferral } from "@/lib/referral";
import { cleanMobile } from "@/lib/session-helpers";
import { leadForPhone } from "@/lib/referral-leads";

export const dynamic = "force-dynamic";

/*
 * GET  /api/referral?code=BAL999  -> who invited (first name only) + reward values
 * POST /api/referral { phone, name } -> after a guest's FIRST order, join the team
 *       of the invite link they came from (code saved in cookie by /r/CODE),
 *       or of the customer who referred this mobile number from the home page popup
 */
export async function GET(req: Request) {
  const code = cleanCode(new URL(req.url).searchParams.get("code") || (await cookies()).get(REF_COOKIE)?.value);
  if (!code) return NextResponse.json({ success: false });
  const [referrer, settings] = await Promise.all([customers.byReferralCode(code).catch(() => null), getStoreSettings()]);
  if (!referrer) return NextResponse.json({ success: false });
  return NextResponse.json({
    success: true,
    code,
    inviter: referrer.name.split(" ")[0],
    welcome: settings.referralWelcome,
    reward: settings.referralReward,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = cleanMobile(body?.phone);
    // 1) invite link cookie (/r/CODE)  2) friend was referred from the home page popup
    let code = cleanCode((await cookies()).get(REF_COOKIE)?.value);
    if (!code) code = cleanCode((await leadForPhone(phone))?.referrerCode);
    if (!code) return NextResponse.json({ success: true, joined: false });
    const name = String(body?.name || "Customer").slice(0, 80);
    // The order that was just placed is allowed (allowOrders: 1)
    const inviter = await joinReferral({ phone, name, code, allowOrders: 1 });
    const res = NextResponse.json({ success: true, joined: Boolean(inviter), inviter });
    if (inviter) res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (error) {
    console.error("REFERRAL ATTACH ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
