import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PUBLIC_DIR } from "@/lib/safe-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Serves /uploads/<file> and /uploads/stock/<file> (product & category pictures).
 * On the live server Next.js only serves files that existed at build time,
 * so pictures uploaded later are sent from here (middleware.ts points /uploads/ here).
 */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  pdf: "application/pdf",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = ((await params).path || []).map(String);
  if (!parts.length || parts.length > 3 || parts.some((p) => !p || p === "." || p === ".." || /[\\/\x00]/.test(p))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const clean = parts[parts.length - 1];
  const m = /^[^/\\\x00-\x1f]+\.([A-Za-z0-9]+)$/.exec(clean); // old uploads may have spaces / Hindi in the name
  const type = m ? TYPES[m[1].toLowerCase()] : undefined;
  if (!m || !type || clean.includes("..")) return new NextResponse("Not found", { status: 404 });

  const file = path.join(PUBLIC_DIR(), ...parts);
  if (!file.startsWith(PUBLIC_DIR() + path.sep) || !fs.existsSync(file)) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
