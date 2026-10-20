import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readProductOrder, sortByProductOrder } from "@/lib/product-order";
import { readProductSeasons } from "@/lib/product-extra";
import { lightImages } from "@/lib/image-migrate";

export const dynamic = "force-dynamic";

/*
 * /api/products
 *   GET  -> all products, in the priority order set by admin (◀ ▶ in Admin > Products)
 *   POST -> create a product (or update the one with the same name)
 */

async function getProductImage(productName: string) {
  try {
    if (!process.env.PEXELS_API_KEY) return "";
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(productName)}&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY },
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.medium || "";
  } catch (error) {
    console.error("PEXELS IMAGE ERROR:", error);
    return "";
  }
}

export async function GET() {
  try {
    const [products, order, seasons] = await Promise.all([prisma.product.findMany({ orderBy: { id: "desc" } }), readProductOrder(), readProductSeasons()]);
    const light = await lightImages(products); // pictures saved inside the database -> files (much faster)
    return NextResponse.json(sortByProductOrder(light, order).map((p) => ({ ...p, season: seasons[String(p.id)] || "" })));
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

const num = (v: unknown, fallback: number) => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const bool = (v: unknown, fallback: boolean) => (v === undefined || v === null || v === "" ? fallback : v === true || v === "true");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    if (!name) return NextResponse.json({ error: "Product name required" }, { status: 400 });

    let image = String(body.image || "").trim();
    if (!image) image = await getProductImage(name);

    const existing = await prisma.product.findFirst({ where: { name } });
    if (existing) {
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: {
          category: body.category || existing.category,
          pack: body.pack || existing.pack,
          price: num(body.price, existing.price),
          mrp: num(body.mrp, existing.mrp),
          stock: existing.stock + num(body.stock, 0),
          image: image || existing.image,
          description: body.description || existing.description,
          bestSeller: bool(body.bestSeller, existing.bestSeller),
          active: bool(body.active, existing.active),
        },
      });
      return NextResponse.json(updated);
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: body.category || "Vegetables",
        pack: body.pack || "1 Pack",
        price: num(body.price, 0),
        mrp: num(body.mrp, 0),
        stock: num(body.stock, 0),
        image,
        description: body.description || "",
        bestSeller: bool(body.bestSeller, false),
        active: bool(body.active, true),
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
