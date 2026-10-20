import { NextResponse } from "next/server";
import { readCategoryImages, readCategoryList, saveCategoryList, type CategoryEntry } from "@/lib/category-images";
import { getAdminSession } from "@/lib/session-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/*
 * Shop categories (Admin > Categories). Saved in the database.
 *   GET -> { categories: [{name, image}], images: {lowercase: image} }
 *   PUT (admin):
 *     { action: "add",    name, image? }   add a new category
 *     { action: "image",  name, image }    set / clear ("" ) the image
 *     { action: "remove", name, moveTo? }  delete (its products move to "moveTo")
 *     { action: "rename", name, newName }  rename (its products are renamed too)
 *     { action: "import", categories: [{name,image}] }  add many (skips existing)
 *     { action: "order",  names: [..] }    save display order (left -> right)
 */

export async function GET() {
  const [categories, images] = await Promise.all([readCategoryList(), readCategoryImages()]);
  return NextResponse.json({ success: true, categories, images });
}

export async function PUT(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "image");
  const name = String(body?.name || "").trim();
  const image = String(body?.image || "").trim();
  let list: CategoryEntry[] = await readCategoryList();
  const idx = list.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());

  if (action === "order") {
    const names: string[] = Array.isArray(body?.names) ? body.names.map((n: unknown) => String(n || "").trim()).filter(Boolean) : [];
    const next: CategoryEntry[] = [];
    for (const n of names) {
      const hit = list.find((c) => c.name.toLowerCase() === n.toLowerCase());
      next.push(hit || { name: n, image: "" });
    }
    for (const c of list) if (!next.some((x) => x.name.toLowerCase() === c.name.toLowerCase())) next.push(c);
    list = next;
  } else if (action === "import") {
    for (const c of Array.isArray(body?.categories) ? body.categories : []) {
      const n = String(c?.name || "").trim();
      if (!n) continue;
      const i = list.findIndex((x) => x.name.toLowerCase() === n.toLowerCase());
      const img = String(c?.image || "").trim();
      if (i < 0) list.push({ name: n, image: img.startsWith("data:") ? "" : img });
      else if (!list[i].image && img && !img.startsWith("data:")) list[i].image = img;
    }
  } else {
    if (!name) return NextResponse.json({ success: false, error: "Enter a category name" }, { status: 400 });
    if (action === "add") {
      if (idx >= 0) return NextResponse.json({ success: false, error: "This category already exists" }, { status: 409 });
      list.push({ name, image });
    } else if (action === "remove") {
      const moveTo = String(body?.moveTo || "").trim();
      const used = await prisma.product.count({ where: { category: name } });
      if (used > 0) {
        if (!moveTo || moveTo.toLowerCase() === name.toLowerCase()) {
          return NextResponse.json({ success: false, error: `${used} products use this category — choose where to move them` }, { status: 400 });
        }
        await prisma.product.updateMany({ where: { category: name }, data: { category: moveTo } });
        if (!list.some((c) => c.name.toLowerCase() === moveTo.toLowerCase())) list.push({ name: moveTo, image: "" });
      }
      list = list.filter((c) => c.name.toLowerCase() !== name.toLowerCase());
    } else if (action === "rename") {
      const newName = String(body?.newName || "").trim().slice(0, 60);
      if (!newName) return NextResponse.json({ success: false, error: "Enter the new name" }, { status: 400 });
      const clash = list.findIndex((c) => c.name.toLowerCase() === newName.toLowerCase());
      if (clash >= 0 && clash !== idx) return NextResponse.json({ success: false, error: "A category with this name already exists" }, { status: 409 });
      if (idx >= 0) list[idx] = { ...list[idx], name: newName };
      else list.push({ name: newName, image: "" });
      await prisma.product.updateMany({ where: { category: name }, data: { category: newName } });
    } else {
      if (idx >= 0) list[idx] = { ...list[idx], image };
      else list.push({ name, image });
    }
  }

  const saved = await saveCategoryList(list);
  return NextResponse.json({ success: true, categories: saved, images: await readCategoryImages() });
}
