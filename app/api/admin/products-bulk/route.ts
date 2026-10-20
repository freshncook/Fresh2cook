import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { readProductOrder, saveProductOrder, sortByProductOrder } from "@/lib/product-order";
import { saveProductSeasons } from "@/lib/product-extra";

export const dynamic = "force-dynamic";

/*
 * Bulk import from CSV / Excel paste (Admin > Bulk Add).
 * POST { rows: [{ srNo, name, category, pack, mrp, price, stock, image, description, season, bestSeller, active }] }
 * Price is optional — if it is empty, the product sells at MRP.
 * Sr. No. sets the display order (1 first). Season / Availability is saved per product.
 * Same name (any case) -> that product is updated. Otherwise a new product is created.
 */

type Row = Record<string, unknown>;

const int = (v: unknown) => {
  if (v === undefined || v === null || String(v).trim() === "") return undefined;
  const n = Math.round(Number(String(v).replace(/[₹,\s]/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};
const yes = (v: unknown) => {
  const t = String(v ?? "").trim().toLowerCase();
  if (!t) return undefined;
  return ["1", "yes", "y", "true", "on", "active"].includes(t);
};
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rows: Row[] = Array.isArray(body?.rows) ? body.rows.slice(0, 2000) : [];
  if (!rows.length) return NextResponse.json({ success: false, error: "No rows to import" }, { status: 400 });

  const existing = await prisma.product.findMany({ select: { id: true, name: true } });
  const byName = new Map(existing.map((p) => [p.name.trim().toLowerCase(), p.id]));
  // Names broken by an earlier upload ("??? (Potato)") — the same row with proper Hindi fixes them
  const brokenKey = (n: string) => n.trim().toLowerCase().replace(/[^\x00-\x7F]/g, "?");
  const broken = new Map(existing.filter((p) => p.name.includes("?")).map((p) => [p.name.trim().toLowerCase(), p.id]));

  let created = 0;
  let updated = 0;
  const errors: { row: number; error: string }[] = [];
  const seasons: Record<number, string> = {};
  const serial: { id: number; sr: number }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = text(r.name, 120);
    if (!name) {
      errors.push({ row: i + 1, error: "Name is missing" });
      continue;
    }
    const mrpRaw = int(r.mrp);
    const ourPrice = int(r.price);
    // New product without "Our Price" sells at MRP. Existing product keeps its price unless "Our Price" is given.
    const price = ourPrice ?? mrpRaw;
    const mrp = mrpRaw;
    const stock = int(r.stock);
    if ([price, mrp, stock].some((n) => Number.isNaN(n))) {
      errors.push({ row: i + 1, error: `${name}: price / MRP / stock must be numbers` });
      continue;
    }

    const data: Record<string, unknown> = {};
    if (text(r.category, 80)) data.category = text(r.category, 80);
    if (text(r.pack, 40)) data.pack = text(r.pack, 40);
    if (ourPrice !== undefined) data.price = ourPrice;
    if (mrp !== undefined) data.mrp = mrp;
    if (stock !== undefined) data.stock = stock;
    if (text(r.image, 1000)) data.image = text(r.image, 1000);
    if (text(r.description, 2000)) data.description = text(r.description, 2000);
    if (yes(r.bestSeller) !== undefined) data.bestSeller = yes(r.bestSeller);
    if (yes(r.active) !== undefined) data.active = yes(r.active);

    try {
      let id = byName.get(name.toLowerCase());
      if (!id && /[^\x00-\x7F]/.test(name)) {
        const old = broken.get(brokenKey(name));
        if (old) {
          id = old;
          data.name = name; // repair the name
          byName.set(name.toLowerCase(), old);
        }
      }
      let savedId = id || 0;
      if (id) {
        await prisma.product.update({ where: { id }, data });
        updated++;
      } else {
        if (price === undefined) {
          errors.push({ row: i + 1, error: `${name}: MRP or price is required for a new product` });
          continue;
        }
        const p = await prisma.product.create({
          data: {
            name,
            category: (data.category as string) || "Vegetables",
            pack: (data.pack as string) || "Piece",
            price,
            mrp: mrp ?? 0,
            stock: stock ?? 0,
            image: (data.image as string) || null,
            description: (data.description as string) || null,
            bestSeller: (data.bestSeller as boolean) ?? false,
            active: (data.active as boolean) ?? true,
          },
        });
        byName.set(name.toLowerCase(), p.id);
        savedId = p.id;
        created++;
      }
      if (r.season !== undefined && String(r.season).trim()) seasons[savedId] = text(r.season, 120);
      const sr = Number(String(r.srNo ?? "").replace(/[^\d.]/g, ""));
      if (sr > 0) serial.push({ id: savedId, sr });
    } catch (e) {
      console.error("BULK ROW ERROR:", e);
      errors.push({ row: i + 1, error: `${name}: could not save` });
    }
  }

  if (Object.keys(seasons).length) await saveProductSeasons(seasons);

  // Sr. No. -> display order on home / shop (1 first), other products keep their order after
  if (serial.length) {
    const all = await prisma.product.findMany({ select: { id: true } });
    const current = sortByProductOrder(all, await readProductOrder()).map((p) => p.id);
    const first = serial.sort((a, b) => a.sr - b.sr).map((x) => x.id);
    await saveProductOrder([...first, ...current.filter((id) => !first.includes(id))]);
  }

  return NextResponse.json({ success: true, created, updated, errors });
}
