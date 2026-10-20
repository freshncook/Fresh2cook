import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSession } from "@/lib/session-helpers";
import { nameTokens, searchQuery } from "@/lib/produce-names";

export const dynamic = "force-dynamic";

/*
 * Finds a plain photo for a product (Admin > Products > Make images).
 *   GET ?name=Aloo&skip=0
 *   1. a matching picture already in the project's public folder (e.g. public/images/aloo.jpg)
 *   2. otherwise one from the internet (Pexels if PEXELS_API_KEY is set, else Openverse
 *      — openly licensed photos), saved to public/uploads/stock/
 * Returns { url, source, credit }. "skip" picks the next result ("Try another photo").
 */

const IMG_EXT = /\.(jpe?g|png|webp)$/i;
const SKIP_NAMES = /(logo|banner|hero|placeholder|f2c-|refer-earn|promise|icon|avatar|rider|qr)/i;

function walk(dir: string, out: string[], depth = 0) {
  if (depth > 4) return;
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!/^(stock|branded|riders?|documents?)$/i.test(e.name)) walk(full, out, depth + 1);
    } else if (IMG_EXT.test(e.name) && !SKIP_NAMES.test(e.name)) out.push(full);
  }
}

function findLocal(name: string, skip: number) {
  const pub = path.join(process.cwd(), "public");
  const files: string[] = [];
  walk(pub, files);
  const tokens = nameTokens(name);
  if (!tokens.length) return [];
  return files
    .map((f) => {
      const words = path.basename(f).toLowerCase().replace(IMG_EXT, "").split(/[^a-z]+/);
      const score = tokens.filter((t) => words.some((w) => w === t || (w.length > 3 && (w.startsWith(t) || t.startsWith(w))))).length;
      return { f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(skip)
    .map((x) => "/" + path.relative(pub, x.f).split(path.sep).join("/"));
}

async function fetchJson(url: string, headers: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Fresh2Cook/1.0", ...headers }, signal: ctrl.signal });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function onlineCandidates(query: string) {
  const list: { url: string; credit: string; source: string }[] = [];
  const key = process.env.PEXELS_API_KEY;
  if (key) {
    const j = await fetchJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`, { Authorization: key });
    for (const p of j?.photos || []) {
      const url = p?.src?.large || p?.src?.medium;
      if (url) list.push({ url, credit: `Photo: ${p.photographer || "Pexels"} / Pexels`, source: "pexels" });
    }
  }
  if (list.length < 3) {
    const j = await fetchJson(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&mature=false&page_size=12`
    );
    for (const r of j?.results || []) {
      if (r?.url && /\.(jpe?g|png|webp)(\?|$)/i.test(r.url)) {
        list.push({ url: r.url, credit: `Photo: ${r.creator || "unknown"} (${String(r.license || "").toUpperCase()}) via Openverse`, source: "openverse" });
      }
    }
  }
  return list;
}

async function download(url: string, slug: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Fresh2Cook/1.0" }, signal: ctrl.signal });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 5000 || buf.length > 12 * 1024 * 1024) return null;
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const dir = path.join(process.cwd(), "public", "uploads", "stock");
    fs.mkdirSync(dir, { recursive: true });
    const file = `${slug}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(dir, file), buf);
    return `/uploads/stock/${file}`;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  const u = new URL(req.url);
  const name = String(u.searchParams.get("name") || "").trim();
  const skip = Math.max(0, Number(u.searchParams.get("skip") || 0) || 0);
  const onlineOnly = u.searchParams.get("online") === "1";
  if (!name) return NextResponse.json({ success: false, error: "name required" }, { status: 400 });

  // 1. picture already in the project folder
  const local = onlineOnly ? [] : findLocal(name, 0);
  if (skip < local.length) {
    return NextResponse.json({ success: true, url: local[skip], source: "folder", credit: "From your image folder", next: skip + 1 });
  }

  // 2. internet
  const query = searchQuery(name);
  const candidates = await onlineCandidates(query);
  const slug = query.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "product";
  const start = Math.max(0, skip - local.length);
  for (let i = start; i < Math.min(candidates.length, start + 4); i++) {
    const saved = await download(candidates[i].url, slug);
    if (saved) return NextResponse.json({ success: true, url: saved, source: candidates[i].source, credit: candidates[i].credit, query, next: local.length + i + 1 });
  }
  return NextResponse.json(
    { success: false, error: `No photo found for "${query}". Upload your own photo for this product.` },
    { status: 404 }
  );
}
