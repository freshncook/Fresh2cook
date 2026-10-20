import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * Product display priority (Admin > Products, ◀ ▶ buttons).
 * Saved in AppSetting "productOrder" as a list of product ids.
 * Products not in the list (new ones) come after, newest first.
 */

export async function readProductOrder(): Promise<number[]> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === "productOrder");
    const list = row ? JSON.parse(row.value) : [];
    return Array.isArray(list) ? list.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
  } catch {
    return [];
  }
}

export async function saveProductOrder(ids: number[]) {
  const seen = new Set<number>();
  const clean = ids.map(Number).filter((n) => Number.isInteger(n) && n > 0 && !seen.has(n) && seen.add(n));
  await writeSetting("productOrder", JSON.stringify(clean.slice(0, 5000)));
  return clean;
}

export function sortByProductOrder<T extends { id: number }>(list: T[], order: number[]): T[] {
  const pos = new Map(order.map((id, i) => [id, i]));
  return [...list].sort((a, b) => {
    const pa = pos.get(a.id);
    const pb = pos.get(b.id);
    if (pa !== undefined && pb !== undefined) return pa - pb;
    if (pa !== undefined) return -1;
    if (pb !== undefined) return 1;
    return b.id - a.id;
  });
}
