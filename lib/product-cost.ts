import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * Purchase rate (cost price) of each product — ADMIN ONLY.
 * Saved in the AppSetting table as key "productCost" = { "<productId>": cost }.
 * The cost is for the product's own pack (same pack as its selling price, normally 1 kg).
 * Never sent to customers (the public /api/products does not include it).
 */
const KEY = "productCost";

export async function readCostMap(): Promise<Record<string, number>> {
  try {
    const rows = await readSettingRows();
    const row = rows.find((r) => r.key === KEY);
    const v = row ? JSON.parse(String(row.value || "{}")) : {};
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

export async function setCosts(updates: Record<string, number | null>) {
  const map = await readCostMap();
  for (const [id, cost] of Object.entries(updates)) {
    if (!/^\d+$/.test(id)) continue;
    if (cost === null || cost === undefined || !Number.isFinite(Number(cost)) || Number(cost) <= 0) delete map[id];
    else map[id] = Math.round(Number(cost) * 100) / 100;
  }
  await writeSetting(KEY, JSON.stringify(map));
  return map;
}
