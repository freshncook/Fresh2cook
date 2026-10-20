/*
 * Smaller product pictures for cards (faster pages on mobile data).
 *   Pexels / Unsplash photos are asked for at card size instead of full size.
 *   Our own pictures are returned unchanged.
 */
export function thumb(url: string | null | undefined, width = 400): string {
  const u = String(url || "").trim();
  if (!u || u.startsWith("data:")) return "";
  try {
    if (/^https:\/\/images\.pexels\.com\//.test(u)) {
      const x = new URL(u);
      x.searchParams.set("auto", "compress");
      x.searchParams.set("cs", "tinysrgb");
      x.searchParams.set("w", String(width));
      x.searchParams.delete("h");
      x.searchParams.delete("dpr");
      return x.toString();
    }
    if (/^https:\/\/images\.unsplash\.com\//.test(u)) {
      const x = new URL(u);
      x.searchParams.set("w", String(width));
      x.searchParams.set("q", "70");
      x.searchParams.set("auto", "format");
      return x.toString();
    }
  } catch {
    /* keep original */
  }
  return u;
}
