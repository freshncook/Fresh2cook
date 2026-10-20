import { NextResponse } from "next/server";
import { REF_COOKIE, cleanCode } from "@/lib/referral";

/*
 * Invite link: https://<site>/r/BAL999
 * Saves the code for 30 days and opens the shop. Whoever signs up or orders
 * from this browser joins the inviter's team automatically.
 */
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = cleanCode(decodeURIComponent(raw || ""));
  const url = new URL(code ? `/?ref=${code}` : "/", req.url);
  const res = NextResponse.redirect(url);
  if (code) {
    res.cookies.set(REF_COOKIE, code, { path: "/", maxAge: 30 * 24 * 60 * 60, sameSite: "lax" });
  }
  return res;
}
