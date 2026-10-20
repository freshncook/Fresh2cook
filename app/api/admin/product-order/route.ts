import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session-helpers";
import { readProductOrder, saveProductOrder } from "@/lib/product-order";

export const dynamic = "force-dynamic";

/* GET -> { ids }   PUT { ids: number[] } (admin) -> save display order of products */

export async function GET() {
  return NextResponse.json({ success: true, ids: await readProductOrder() });
}

export async function PUT(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body?.ids)) return NextResponse.json({ success: false, error: "ids required" }, { status: 400 });
  const ids = await saveProductOrder(body.ids);
  return NextResponse.json({ success: true, ids });
}
