import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
 * /api/products/:id
 *   GET    -> one product
 *   PATCH  -> update any of: name, category, pack, mrp, price, stock, image, description, bestSeller, active
 *   DELETE -> remove product (if it is in old orders it is only switched off, so order history stays)
 *   POST   -> (old) create product — kept for compatibility
 */

type Ctx = { params: Promise<{ id: string }> };

async function productId(ctx: Ctx) {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const id = await productId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ success: true, product });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const id = await productId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};

    const text = (k: string, max = 300) => {
      if (body[k] === undefined) return;
      data[k] = String(body[k] ?? "").trim().slice(0, max);
    };
    const int = (k: string) => {
      if (body[k] === undefined || body[k] === "") return;
      const n = Math.round(Number(body[k]));
      if (!Number.isFinite(n) || n < 0) throw new Error(`${k} is not a valid number`);
      data[k] = n;
    };
    const bool = (k: string) => {
      if (body[k] === undefined) return;
      data[k] = body[k] === true || body[k] === "true";
    };

    text("name", 120);
    text("category", 80);
    text("pack", 40);
    text("description", 2000);
    if (body.image !== undefined) data.image = String(body.image ?? "").trim() || null;
    int("mrp");
    int("price");
    int("stock");
    bool("bestSeller");
    bool("active");

    if (data.name === "") return NextResponse.json({ error: "Product name required" }, { status: 400 });
    if (data.category === "") delete data.category;
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const id = await productId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const used = await prisma.orderItem.count({ where: { productId: id } });
    if (used > 0) {
      const product = await prisma.product.update({ where: { id }, data: { active: false } });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        product,
        message: "This product is in past orders, so it was made inactive instead of deleted.",
      });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: String(body.name || "Product"),
        category: body.category || "Vegetables",
        price: Number(body.price) || 0,
        mrp: Number(body.mrp) || 0,
        pack: String(body.pack || "Piece"),
        stock: Number(body.stock) || 0,
        image: body.image || null,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Create Failed" }, { status: 500 });
  }
}
