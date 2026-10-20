import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreSettings, publicSettings } from "@/lib/store-settings";
import { readCategoryImages, readCategoryList } from "@/lib/category-images";
import { readProductOrder, sortByProductOrder } from "@/lib/product-order";
import { lightImages } from "@/lib/image-migrate";

export const dynamic = "force-dynamic";

/*
 * Everything the home page needs in one call — all from the database:
 * categories (from products), best sellers, real customer reviews, shop settings.
 */

export async function GET() {
  try {
    const [rawProducts, feedback, settings, catImages, adminCats, order] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, name: true, price: true, mrp: true, pack: true, stock: true, image: true, category: true, bestSeller: true },
        orderBy: { id: "desc" },
      }),
      prisma.customerFeedback
        .findMany({ where: { rating: { gte: 4 } }, orderBy: { id: "desc" }, take: 6, select: { id: true, customer: true, rating: true, comment: true } })
        .catch(() => [] as { id: number; customer: string; rating: number; comment: string }[]),
      getStoreSettings(),
      readCategoryImages(),
      readCategoryList(),
      readProductOrder(),
    ]);
    // admin priority order (◀ ▶ in Admin > Products)
    const products = sortByProductOrder(await lightImages(rawProducts), order);

    const catMap = new Map<string, { name: string; count: number; image: string | null }>();
    for (const p of products) {
      const name = String(p.category || "").trim();
      if (!name) continue;
      const c = catMap.get(name.toLowerCase()) || { name, count: 0, image: null };
      c.count++;
      if (!c.image && p.image) c.image = p.image;
      catMap.set(name.toLowerCase(), c);
    }

    const inStock = products.filter((p) => Number(p.stock) > 0);
    const best = inStock.filter((p) => p.bestSeller);
    const bestSellers = (best.length >= 8 ? best : [...best, ...inStock.filter((p) => !p.bestSeller)]).slice(0, 16);

    return NextResponse.json({
      success: true,
      settings: publicSettings(settings),
      // Admin > Categories list first (in admin order, even with 0 products),
      // then any other category used by products. Admin image wins over product photo.
      categories: [
        ...adminCats.map((a) => {
          const c = catMap.get(a.name.toLowerCase());
          return { name: a.name, count: c?.count || 0, image: a.image || c?.image || null };
        }),
        ...[...catMap.values()]
          .filter((c) => !adminCats.some((a) => a.name.toLowerCase() === c.name.toLowerCase()))
          .map((c) => ({ ...c, image: catImages[c.name.toLowerCase()] || c.image }))
          .sort((a, b) => b.count - a.count),
      ],
      bestSellers,
      totalProducts: products.length,
      reviews: feedback
        .filter((f) => String(f.comment || "").trim().length > 3)
        .map((f) => {
          const parts = String(f.customer || "Customer").trim().split(/\s+/);
          return {
            id: f.id,
            name: parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0],
            rating: Math.min(5, Math.max(1, Number(f.rating) || 5)),
            comment: String(f.comment).slice(0, 160),
          };
        }),
    });
  } catch (error) {
    console.error("HOME DATA ERROR:", error);
    return NextResponse.json({ success: false, error: "Could not load" }, { status: 500 });
  }
}
