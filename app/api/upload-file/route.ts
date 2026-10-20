import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { callerOf } from "@/lib/caller";
import { MAX_UPLOAD_BYTES, PRIVATE_DIR, PUBLIC_DIR, sniffType } from "@/lib/safe-upload";

export const runtime = "nodejs";

/*
 * POST form-data { file, private? }
 *   Admin                 -> product / category pictures in /public/uploads (private=1 for documents)
 *   Rider, processing staff -> always PRIVATE (KYC documents), shown only to admin + owner
 * Login is checked by middleware.ts.
 */
export async function POST(req: Request) {
  try {
    const who = callerOf(req);
    if (who.kind !== "admin" && who.kind !== "staff" && who.kind !== "rider") {
      return NextResponse.json({ success: false, error: "Please log in to upload." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ success: false, error: "File is too big. Maximum 8 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffType(bytes);
    if (!ext) {
      return NextResponse.json({ success: false, error: "Only JPG, PNG, WEBP, GIF photos or PDF files are allowed." }, { status: 400 });
    }

    const wantsPrivate = String(form.get("private") || "") === "1";
    const isPrivate = who.kind !== "admin" || wantsPrivate;
    const random = randomBytes(12).toString("hex");

    if (isPrivate) {
      const tag = who.kind === "rider" ? "r" : who.kind === "admin" ? "a" : "s";
      const name = `${tag}${who.id}-${random}.${ext}`;
      const dir = PRIVATE_DIR();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), bytes);
      return NextResponse.json({ success: true, url: `/api/private-file/${name}`, private: true });
    }

    const name = `${Date.now()}-${random}.${ext}`;
    const dir = PUBLIC_DIR();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), bytes);
    return NextResponse.json({ success: true, url: `/uploads/${name}` });
  } catch (error) {
    console.error("UPLOAD FILE ERROR", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
