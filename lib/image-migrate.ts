import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { PUBLIC_DIR, sniffType } from "@/lib/safe-upload";

/*
 * Some old products have their picture saved INSIDE the database as a long text
 * ("data:image/..."). That makes every product list very heavy and the shop slow.
 * This moves such pictures once into /public/uploads/products/ and saves the short link.
 * Runs automatically (a few products at a time) when the product list is loaded.
 */
const g = globalThis as unknown as { __f2cImgMigrating?: boolean };

export async function moveInlineImages(products: { id: number; image: string | null }[], limit = 25) {
  const todo = products.filter((p) => String(p.image || "").startsWith("data:")).slice(0, limit);
  if (!todo.length || g.__f2cImgMigrating) return new Map<number, string>();
  g.__f2cImgMigrating = true;
  const done = new Map<number, string>();
  try {
    const dir = path.join(PUBLIC_DIR(), "products");
    fs.mkdirSync(dir, { recursive: true });
    for (const p of todo) {
      try {
        const raw = String(p.image);
        const comma = raw.indexOf(",");
        if (comma < 0 || !raw.slice(0, comma).includes(";base64")) continue;
        const bytes = Buffer.from(raw.slice(comma + 1), "base64");
        const ext = sniffType(new Uint8Array(bytes));
        if (!ext || ext === "pdf") continue;
        const name = `p${p.id}-${randomBytes(6).toString("hex")}.${ext}`;
        fs.writeFileSync(path.join(dir, name), bytes);
        const url = `/uploads/products/${name}`;
        await prisma.product.update({ where: { id: p.id }, data: { image: url } });
        done.set(p.id, url);
      } catch (e) {
        console.error("IMAGE MOVE ERROR", p.id, e);
      }
    }
  } finally {
    g.__f2cImgMigrating = false;
  }
  return done;
}

/** Replace inline pictures in a list (moved ones get their new link, others are hidden) */
export async function lightImages<T extends { id: number; image: string | null }>(list: T[]): Promise<T[]> {
  const moved = await moveInlineImages(list);
  return list.map((p) => {
    const img = String(p.image || "");
    if (!img.startsWith("data:")) return p;
    return { ...p, image: moved.get(p.id) || null };
  });
}
