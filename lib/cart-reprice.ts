import { priceForPack, type PackExtras } from "@/lib/pack-price";

/*
 * Cart prices are saved in the browser when an item is added. If the admin changes a price
 * later, this updates the cart to today's price (the server also checks it when the order is placed).
 */
type Item = { id: number; price: number; mrp?: number; pack?: string };
type Product = { id: number; price: number; mrp?: number | null; pack?: string | null; active?: boolean };

export function repriceCart<T extends Item>(items: T[], products: Product[], rules: PackExtras): { items: T[]; changed: boolean } {
  const byId = new Map(products.map((p) => [Number(p.id), p]));
  let changed = false;
  const out = items.map((i) => {
    const p = byId.get(Number(i.id));
    if (!p) return i;
    const { price, mrp } = priceForPack(p, String(i.pack || p.pack || ""), rules);
    if (price !== Number(i.price) || (mrp || 0) !== Number(i.mrp || 0)) {
      changed = true;
      return { ...i, price, mrp };
    }
    return i;
  });
  return { items: out, changed };
}
