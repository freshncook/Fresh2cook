import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * Extra product details that are not columns in the Product table
 * (so no database migration is needed):
 *   AppSetting "productSeason" -> { [productId]: "Season / Availability" text }
 */

export async function readProductSeasons(): Promise<Record<string, string>> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === "productSeason");
    const map = row ? JSON.parse(row.value) : {};
    return map && typeof map === "object" ? map : {};
  } catch {
    return {};
  }
}

export async function saveProductSeasons(updates: Record<number, string>) {
  const map = await readProductSeasons();
  for (const [id, text] of Object.entries(updates)) {
    const t = String(text || "").trim().slice(0, 120);
    if (t) map[id] = t;
    else delete map[id];
  }
  await writeSetting("productSeason", JSON.stringify(map));
  return map;
}
