import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * Shop categories managed by admin (Admin > Categories), saved in the database.
 *   AppSetting "categoryList"   -> [{ name, image }] in display order
 *   AppSetting "categoryImages" -> (older) { lowercase name: image } — still read
 */

export type CategoryEntry = { name: string; image: string };

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === key);
    return row ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function readCategoryList(): Promise<CategoryEntry[]> {
  const list = await readJson<CategoryEntry[]>("categoryList", []);
  const legacy = await readJson<Record<string, string>>("categoryImages", {});
  const out: CategoryEntry[] = Array.isArray(list)
    ? list.filter((c) => c && String(c.name || "").trim()).map((c) => ({ name: String(c.name).trim(), image: String(c.image || "") }))
    : [];
  // older image-only entries
  for (const [k, img] of Object.entries(legacy && typeof legacy === "object" ? legacy : {})) {
    const hit = out.find((c) => c.name.toLowerCase() === k);
    if (hit) {
      if (!hit.image) hit.image = img;
    }
  }
  return out;
}

export async function saveCategoryList(list: CategoryEntry[]) {
  // keep images saved earlier in the old image-only map (v9)
  const legacy = await readJson<Record<string, string>>("categoryImages", {});
  for (const [k, img] of Object.entries(legacy && typeof legacy === "object" ? legacy : {})) {
    if (!img) continue;
    const hit = list.find((c) => c.name.toLowerCase() === k);
    if (!hit) list.push({ name: k.replace(/\b\w/g, (ch) => ch.toUpperCase()), image: img });
  }
  const seen = new Set<string>();
  const clean = list
    .map((c) => ({ name: String(c.name || "").trim().slice(0, 60), image: String(c.image || "").trim().slice(0, 1000) }))
    .filter((c) => c.name && !seen.has(c.name.toLowerCase()) && seen.add(c.name.toLowerCase()));
  await writeSetting("categoryList", JSON.stringify(clean));
  // older image-only map is now part of the list
  await writeSetting("categoryImages", "{}");
  return clean;
}

/** Image map (lowercase name -> image) used by the home page */
export async function readCategoryImages(): Promise<Record<string, string>> {
  const legacy = await readJson<Record<string, string>>("categoryImages", {});
  const map: Record<string, string> = { ...(legacy && typeof legacy === "object" ? legacy : {}) };
  for (const c of await readCategoryList()) if (c.image) map[c.name.toLowerCase()] = c.image;
  return map;
}
