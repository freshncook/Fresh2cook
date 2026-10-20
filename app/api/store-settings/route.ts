import { NextResponse } from "next/server";
import { getStoreSettings, publicSettings, saveStoreSettings, settingsTableReady } from "@/lib/store-settings";
import { getAdminSession } from "@/lib/session-helpers";

export const dynamic = "force-dynamic";

/*
 * GET  /api/store-settings        -> public values for cart / checkout
 * GET  /api/store-settings?all=1  -> every setting (admin only)
 * PUT  /api/store-settings        -> save (admin only)
 */

export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all") === "1";
  const settings = await getStoreSettings();

  if (!all) {
    return NextResponse.json({ success: true, settings: publicSettings(settings) });
  }

  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    settings,
    tableReady: settingsTableReady(),
    admin: { name: admin.name, mobile: admin.mobile },
  });
}

export async function PUT(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await saveStoreSettings(body || {});
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, settings: result.settings, message: "Settings saved" });
}
