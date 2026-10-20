"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { makeBrandedImage } from "@/lib/branded-image";
import { englishName } from "@/lib/produce-names";

/*
 * Admin > Products > Make images
 * For products without a picture: finds a photo (your image folder first, then online),
 * puts it in the Fresh2Cook design and saves it to the product.
 */

type Product = { id: number; name: string; category?: string; image?: string | null };
type Item = {
  status: "idle" | "finding" | "ready" | "saving" | "saved" | "error";
  photo?: string;
  preview?: string;
  blob?: Blob;
  credit?: string;
  next?: number;
  error?: string;
  subtitle: string;
};

const noImage = (p: Product) => !p.image || !p.image.trim() || /placeholder/i.test(p.image);

function defaultSubtitle(p: Product) {
  const en = englishName(p.name);
  if (en && !p.name.toLowerCase().includes(en.split(" ")[0])) return `(${en.replace(/\b\w/g, (c) => c.toUpperCase())})`;
  return p.category || "";
}

async function upload(blob: Blob, name: string) {
  const form = new FormData();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  form.append("file", new File([blob], `f2c-${slug}.jpg`, { type: "image/jpeg" }));
  const r = await fetch("/api/upload-file", { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  if (!j.url) throw new Error(j.error || "Upload failed");
  return String(j.url);
}

export default function ProductImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [items, setItems] = useState<Record<number, Item>>({});
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => setProducts(Array.isArray(list) ? list : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = products.filter((p) => showAll || noImage(p));
  const item = (p: Product): Item => items[p.id] || { status: "idle", subtitle: defaultSubtitle(p) };
  const patch = (id: number, data: Partial<Item>) =>
    setItems((cur) => ({ ...cur, [id]: { ...(cur[id] || { status: "idle", subtitle: "" }), ...data } }));

  async function compose(p: Product, photo: string, subtitle: string) {
    const blob = await makeBrandedImage({ photo, name: p.name, subtitle });
    return { blob, preview: URL.createObjectURL(blob) };
  }

  async function find(p: Product, skip = 0) {
    const it = item(p);
    patch(p.id, { status: "finding", error: undefined, subtitle: it.subtitle });
    try {
      const r = await fetch(`/api/admin/product-photo?name=${encodeURIComponent(p.name)}&skip=${skip}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) throw new Error("Admin login required");
      if (!j.success) throw new Error(j.error || "No photo found");
      const { blob, preview } = await compose(p, j.url, it.subtitle);
      patch(p.id, { status: "ready", photo: j.url, credit: j.credit, next: j.next ?? skip + 1, blob, preview });
      return true;
    } catch (e) {
      patch(p.id, { status: "error", error: e instanceof Error ? e.message : "Failed" });
      return false;
    }
  }

  async function useOwnPhoto(p: Product, file: File) {
    const url = URL.createObjectURL(file);
    try {
      const { blob, preview } = await compose(p, url, item(p).subtitle);
      patch(p.id, { status: "ready", photo: url, credit: "Your photo", blob, preview, error: undefined });
    } catch (e) {
      patch(p.id, { status: "error", error: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function redraw(p: Product, subtitle: string) {
    const it = item(p);
    patch(p.id, { subtitle });
    if (!it.photo) return;
    const { blob, preview } = await compose(p, it.photo, subtitle);
    patch(p.id, { blob, preview, status: "ready" });
  }

  async function save(p: Product) {
    const it = item(p);
    if (!it.blob) return false;
    patch(p.id, { status: "saving" });
    try {
      const url = await upload(it.blob, p.name);
      const r = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (!r.ok) throw new Error("Could not save to product");
      patch(p.id, { status: "saved" });
      setProducts((cur) => cur.map((x) => (x.id === p.id ? { ...x, image: url } : x)));
      return true;
    } catch (e) {
      patch(p.id, { status: "error", error: e instanceof Error ? e.message : "Save failed" });
      return false;
    }
  }

  async function makeAll() {
    const todo = shown.filter((p) => item(p).status !== "ready" && item(p).status !== "saved");
    for (let i = 0; i < todo.length; i++) {
      setBatch(`Finding photos ${i + 1} / ${todo.length}…`);
      await find(todo[i]);
    }
    setBatch("");
  }

  async function saveAll() {
    const ready = shown.filter((p) => item(p).status === "ready");
    let ok = 0;
    for (let i = 0; i < ready.length; i++) {
      setBatch(`Saving ${i + 1} / ${ready.length}…`);
      if (await save(ready[i])) ok++;
    }
    setBatch(`${ok} images saved ✓`);
    window.setTimeout(() => setBatch(""), 3000);
  }

  const readyCount = shown.filter((p) => item(p).status === "ready").length;

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold text-[#063f3d]">🖼 Make product images</h1>
          <p className="text-[11px] text-slate-500">Photo from your image folder (or online) → Fresh2Cook design → saved to the product</p>
        </div>
        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-emerald-600" />
          Show all products
        </label>
        <button onClick={() => void makeAll()} disabled={!!batch || !shown.length} className="rounded-lg bg-[#159447] px-2.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-40">
          ✨ Make all ({shown.length})
        </button>
        <button onClick={() => void saveAll()} disabled={!!batch || !readyCount} className="rounded-lg border border-emerald-600 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700 disabled:opacity-40">
          ✓ Save all ({readyCount})
        </button>
        <Link href="/admin/products-manage" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700">
          ← Products
        </Link>
      </div>

      {batch && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-800">{batch}</p>}

      {loading ? (
        <p className="py-10 text-center text-[13px] text-slate-500">Loading products…</p>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center">
          <p className="text-2xl">🎉</p>
          <p className="text-[13px] font-semibold text-slate-700">Every product has an image.</p>
          <p className="text-[11px] text-slate-500">Tick &quot;Show all products&quot; to remake any image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {shown.map((p) => {
            const it = item(p);
            const busy = it.status === "finding" || it.status === "saving";
            return (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative aspect-square bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.preview || (noImage(p) ? "/placeholder-product.png" : String(p.image))} alt={p.name} className="h-full w-full object-contain" />
                  {busy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-[12px] font-bold text-emerald-800">
                      {it.status === "finding" ? "Finding photo…" : "Saving…"}
                    </div>
                  )}
                  {it.status === "saved" && <span className="absolute right-1 top-1 rounded bg-emerald-600 px-1.5 text-[10px] font-bold text-white">Saved ✓</span>}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1.5">
                  <div className="truncate text-[12px] font-bold text-slate-900">{p.name}</div>
                  <input
                    value={it.subtitle}
                    onChange={(e) => void redraw(p, e.target.value)}
                    placeholder="Second line (optional)"
                    className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] focus:border-emerald-500 focus:outline-none"
                    aria-label="Second line on the image"
                  />
                  {it.credit && <div className="truncate text-[9px] text-slate-400" title={it.credit}>{it.credit}</div>}
                  {it.error && <div className="text-[10px] font-semibold text-rose-600">{it.error}</div>}
                  <div className="mt-auto grid grid-cols-3 gap-1 pt-0.5">
                    <button
                      onClick={() => void find(p, it.photo ? it.next || 1 : 0)}
                      disabled={busy}
                      className="rounded-md border border-slate-200 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      title={it.photo ? "Try another photo" : "Find a photo"}
                    >
                      {it.photo ? "↻ Other" : "✨ Make"}
                    </button>
                    <label className="cursor-pointer rounded-md border border-slate-200 py-1 text-center text-[10px] font-bold text-slate-700 hover:bg-slate-50" title="Use your own photo">
                      📷 Mine
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void useOwnPhoto(p, f);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => void save(p)}
                      disabled={busy || it.status !== "ready"}
                      className="rounded-md bg-[#159447] py-1 text-[10px] font-bold text-white disabled:opacity-30"
                    >
                      ✓ Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-400">
        Online photos come from Pexels (if a PEXELS_API_KEY is set) or Openverse (openly licensed photos for commercial use). Check each picture before saving.
      </p>
    </div>
  );
}
