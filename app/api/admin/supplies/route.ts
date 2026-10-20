import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { getStoreSettings } from "@/lib/store-settings";
import { packingStats, readRequests, readSupplies, saveRequests, saveSupplies, type Supply } from "@/lib/staff-tools";

export const dynamic = "force-dynamic";

/*
 * Admin > Staff & Supplies
 *   GET -> supplies (balance / minimum), supply requests from processing staff, staff packing + reward
 *   PUT { action: "supplies", list }          -> save the materials list
 *       { action: "request", id, status }      -> Approved / Delivered (adds qty to balance) / Rejected
 */

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const settings = await getStoreSettings();
  const reward = Number(settings.processingReward ?? 5);
  const staff = await prisma.staffUser.findMany({ where: { role: "PROCESSING" }, select: { id: true, name: true, mobile: true, active: true }, orderBy: { name: "asc" } });
  const staffStats = await Promise.all(
    staff.map(async (s) => {
      const st = await packingStats(s.id, reward);
      return { ...s, total: st.total, today: st.today, week: st.week, month: st.month, rewardTotal: st.rewardTotal, rewardWeek: st.rewardWeek };
    })
  );
  return NextResponse.json({ success: true, reward, supplies: await readSupplies(), requests: await readRequests(), staff: staffStats });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body?.action === "supplies") {
    const list = await saveSupplies(Array.isArray(body.list) ? (body.list as Supply[]) : []);
    return NextResponse.json({ success: true, supplies: list });
  }
  if (body?.action === "request") {
    const requests = await readRequests();
    const r = requests.find((x) => x.id === Number(body.id));
    const status = String(body.status);
    if (!r || !["Approved", "Delivered", "Rejected"].includes(status)) return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    if (status === "Delivered" && r.status !== "Delivered") {
      const supplies = await readSupplies();
      for (const it of r.items) {
        const s = supplies.find((x) => x.key === it.key);
        if (s) s.balance += it.qty;
      }
      await saveSupplies(supplies);
    }
    r.status = status as typeof r.status;
    r.updatedAt = Date.now();
    await saveRequests(requests);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
