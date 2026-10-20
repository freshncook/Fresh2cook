import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { callerOf } from "@/lib/caller";
import { MIME, PRIVATE_DIR, PRIVATE_NAME } from "@/lib/safe-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * GET /api/private-file/r12-xxxx.jpg
 * KYC documents. Admin can open all; a rider / staff member can open only their own.
 */
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = PRIVATE_NAME.exec(String(name || ""));
  if (!m) return new NextResponse("Not found", { status: 404 });

  const who = callerOf(req);
  const ownerKind = m[1];
  const ownerId = Number(m[2]);
  const allowed =
    who.kind === "admin" ||
    (who.kind === "rider" && ownerKind === "r" && who.id === ownerId) ||
    (who.kind === "staff" && ownerKind === "s" && who.id === ownerId);
  if (!allowed) return new NextResponse("Not found", { status: 404 });

  const file = path.join(PRIVATE_DIR(), m[0]);
  if (!fs.existsSync(file)) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": MIME[m[4]] || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
