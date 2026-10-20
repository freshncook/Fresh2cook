import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session-helpers";
import { lanAddresses } from "@/lib/lan";

export const dynamic = "force-dynamic";

/* Admin: the address to open this website on a phone in the same Wi-Fi */
export async function GET(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const host = req.headers.get("host") || "localhost:3000";
  const port = host.includes(":") ? host.split(":").pop() : "3000";
  const ips = lanAddresses();
  return NextResponse.json({ success: true, urls: ips.map((ip) => `http://${ip}:${port}`), port, dev: process.env.NODE_ENV !== "production" });
}
