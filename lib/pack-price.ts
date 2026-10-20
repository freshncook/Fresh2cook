/*
 * Pack size pricing.
 * The product price is for its own pack (normally 1 kg).
 * Admin > Settings > "Pack sizes" decides which packs customers can choose
 * (e.g. 50g, 100g, 250g, 500g, 1kg, Bunch, Pack, Piece) and the extra ₹ on each.
 * Only products priced per 1 kg get that list (customer sees 250g first).
 * A product saved with any other weight (15g, 100g, 400g ...) is sold only as that pack.
 *   Smaller weight than the product pack -> weight share of the price + that pack's extra
 *   Bigger weight                         -> simple multiple + that pack's extra (normally 0)
 *   Bunch / Pack / Piece (not a weight)   -> product price + that pack's extra (normally 0)
 */

export type PackSize = { label: string; extra: number };
export type PackExtras = { packExtra500: number; packExtra250: number; packSizes?: PackSize[] | string | null };

/** "1 kg", "1kg", "500 g", "250gm", "0.5 kg" -> grams; anything else -> null */
export function packGrams(pack?: string | null): number | null {
  const m = String(pack || "").toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilo|g|gm|gms|gram|grams)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(m[2].startsWith("k") ? n * 1000 : n);
}

export function packLabel(grams: number) {
  return grams >= 1000 ? `${grams / 1000}kg` : `${grams}g`;
}

/** Tidy a label typed by the admin: "100 gm" -> "100g", "2 KG" -> "2kg", "bunch" -> "Bunch" */
export function cleanPackLabel(raw: string) {
  const s = String(raw || "").trim().replace(/\s+/g, " ").slice(0, 20);
  if (!s) return "";
  if (/^\d+(\.\d+)?$/.test(s)) return packLabel(Math.round(Number(s))); // "15" -> "15g"
  const g = packGrams(s);
  if (g && /^\s*\d+(\.\d+)?\s*(kg|kgs|kilo|g|gm|gms|gram|grams)\s*$/i.test(s)) return packLabel(g);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function defaultPackSizes(extras?: Partial<PackExtras>): PackSize[] {
  return [
    { label: "250g", extra: Number(extras?.packExtra250 ?? 15) },
    { label: "500g", extra: Number(extras?.packExtra500 ?? 10) },
    { label: "1kg", extra: 0 },
    { label: "Bunch", extra: 0 },
    { label: "Pack", extra: 0 },
    { label: "Piece", extra: 0 },
  ];
}

/** Read the admin list (JSON text or array). Weights are sorted small -> big, then the others. */
export function parsePackSizes(value: unknown, extras?: Partial<PackExtras>): PackSize[] {
  let list: unknown = value;
  if (typeof value === "string") {
    try {
      list = value.trim() ? JSON.parse(value) : null;
    } catch {
      list = null;
    }
  }
  if (!Array.isArray(list)) return defaultPackSizes(extras);
  const seen = new Set<string>();
  const out: PackSize[] = [];
  for (const item of list) {
    const label = cleanPackLabel(typeof item === "string" ? item : (item as PackSize)?.label);
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    const extra = Math.max(0, Math.min(1000, Math.round(Number((item as PackSize)?.extra || 0)) || 0));
    out.push({ label, extra });
  }
  if (!out.length) return defaultPackSizes(extras);
  return sortPackSizes(out);
}

export function sortPackSizes(list: PackSize[]) {
  const weights = list.filter((p) => packGrams(p.label)).sort((a, b) => (packGrams(a.label) || 0) - (packGrams(b.label) || 0));
  const others = list.filter((p) => !packGrams(p.label));
  return [...weights, ...others];
}

function sizesOf(extras?: Partial<PackExtras>) {
  return parsePackSizes(extras?.packSizes ?? null, extras);
}

/** Options for the pack dropdown */
export function packOptions(basePack?: string | null, extras?: Partial<PackExtras>): string[] {
  const sizes = sizesOf(extras);
  const g = packGrams(basePack);
  if (g && g !== 1000) return [packLabel(g)]; // fixed pack, e.g. 100g coriander, 400g mushroom
  if (g) {
    const labels = sizes.map((s) => s.label);
    // the product's own pack is always available
    if (!labels.some((l) => packGrams(l) === g)) labels.push(packLabel(g));
    return sortPackSizes(labels.map((label) => ({ label, extra: 0 }))).map((s) => s.label);
  }
  const base = String(basePack || "Piece");
  return Array.from(new Set([base, ...sizes.filter((s) => !packGrams(s.label)).map((s) => s.label)]));
}

/** Pack shown first to customers: 250g if the admin keeps it, else the smallest weight */
export function shopDefaultPack(basePack?: string | null, extras?: Partial<PackExtras>) {
  const g = packGrams(basePack);
  if (!g) return String(basePack || "Piece");
  if (g !== 1000) return packLabel(g); // fixed pack keeps its own size
  const opts = packOptions(basePack, extras);
  return opts.find((o) => packGrams(o) === 250) || opts.find((o) => packGrams(o)) || packLabel(packGrams(basePack) || 1000);
}

/** The dropdown value that matches the product's own pack */
export function defaultPack(basePack?: string | null) {
  const g = packGrams(basePack);
  return g ? packLabel(g) : String(basePack || "Piece");
}

function extraFor(selected: string, extras: Partial<PackExtras>) {
  const sizes = sizesOf(extras);
  const g = packGrams(selected);
  const hit = sizes.find((s) => (g ? packGrams(s.label) === g : s.label.toLowerCase() === String(selected).toLowerCase()));
  if (hit) return hit.extra;
  if (g && g <= 250) return Number(extras.packExtra250 || 0);
  if (g && g <= 500) return Number(extras.packExtra500 || 0);
  return 0;
}

export function priceForPack(
  product: { price: number; mrp?: number | null; pack?: string | null },
  selected: string,
  extras: PackExtras
): { price: number; mrp: number } {
  const price = Number(product.price || 0);
  const mrp = Number(product.mrp || 0) > price ? Number(product.mrp) : 0;
  const base = packGrams(product.pack);
  const want = packGrams(selected);

  // Same pack as the product -> its own price
  if ((base && want && base === want) || (!want && String(selected).toLowerCase() === String(product.pack || "").toLowerCase())) {
    return { price, mrp };
  }

  const extra = extraFor(selected, extras);

  // Bunch / Pack / Piece, or a non-weight product
  if (!base || !want) {
    const p = Math.round(price + extra);
    const m = mrp ? Math.round(mrp + extra) : 0;
    return { price: p, mrp: m > p ? m : 0 };
  }

  const ratio = want / base;
  const p = Math.round(price * ratio + extra);
  const m = mrp ? Math.round(mrp * ratio + extra) : 0;
  return { price: p, mrp: m > p ? m : 0 };
}
