import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session-helpers";
import { readCostMap, setCosts } from "@/lib/product-cost";

export const dynamic = "force-dynamic";

/* Admin only: GET -> { costs: { id: cost } } · POST { id, cost } or { costs: { id: cost } } */
export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  return NextResponse.json({ success: true, costs: await readCostMap() });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updates: Record<string, number | null> =
    body?.costs && typeof body.costs === "object" ? body.costs : body?.id ? { [String(body.id)]: body.cost === "" ? null : Number(body.cost) } : {};
  const costs = await setCosts(updates);
  return NextResponse.json({ success: true, costs });
}
