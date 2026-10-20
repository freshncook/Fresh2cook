"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
 * Admin > Categories — add / remove shop categories and change their images.
 * Saved in the database: home page "Shop by category" and the product form use this list.
 */

type Row = { name: string; image: string; count: number; productImage: string | null; inList: boolean };

async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch("/api/upload-file", { method: "POST", body: form });
  const j = await r.json();
  if (!j.url) throw new Error(j.error || "Upload failed");
  return String(j.url);
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [moveTo, setMoveTo] = useState("");

  async function put(body: Record<string, unknown>) {
    const r = await fetch("/api/category-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.status === 401) {
      setNeedsLogin(true);
      throw new Error("Admin login required");
    }
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Save failed");
    return j;
  }

  async function load() {
    setLoading(true);
    try {
      // One-time: bring categories saved earlier only in this browser into the database
      try {
        const local = JSON.parse(localStorage.getItem("freshcut-categories") || "[]");
        if (Array.isArray(local) && local.length && !localStorage.getItem("freshcut-categories-imported")) {
          await put({ action: "import", categories: local.map((c: { name?: string; image?: string }) => ({ name: c?.name, image: c?.image })) });
          localStorage.setItem("freshcut-categories-imported", "1");
          setMsg({ ok: true, text: `${local.length} old categories imported` });
        }
      } catch {
        /* ignore */
      }

      const [cats, products] = await Promise.all([
        fetch("/api/category-images", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      ]);
      const counts = new Map<string, { count: number; image: string | null; name: string }>();
      for (const p of Array.isArray(products) ? products : []) {
        const name = String(p?.category || "").trim();
        if (!name) continue;
        const c = counts.get(name.toLowerCase()) || { count: 0, image: null, name };
        c.count++;
        if (!c.image && p?.image) c.image = p.image;
        counts.set(name.toLowerCase(), c);
      }
      const list: Row[] = (cats?.categories || []).map((c: { name: string; image: string }) => {
        const k = c.name.toLowerCase();
        return { name: c.name, image: c.image || "", count: counts.get(k)?.count || 0, productImage: counts.get(k)?.image || null, inList: true };
      });
      for (const [k, c] of counts) {
        if (!list.some((r) => r.name.toLowerCase() === k)) {
          list.push({ name: c.name, image: cats?.images?.[k] || "", count: c.count, productImage: c.image, inList: false });
        }
      }
      setRows(list);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function run(key: string, fn: () => Promise<unknown>, okText: string) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
      await load();
      return true;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
      return false;
    } finally {
      setBusy(null);
    }
  }

  // Move a category left (-1) or right (+1) — this is the order on the home page
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    void run(`move-${rows[i].name}`, () => put({ action: "order", names: next.map((r) => r.name) }), "Order saved");
  }

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center">
        <h1 className="text-base font-bold">Admin login required</h1>
        <a href="/admin/login?next=/admin/categories" className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white">
          Admin login
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Categories</h1>
          <p className="text-[11px] text-slate-500">
            Same order as &quot;Shop by category&quot; on the home page — use ◀ ▶ to set priority ·{" "}
            <Link href="/admin/products-manage" className="font-semibold text-emerald-700">
              Products →
            </Link>
          </p>
        </div>
        <a href="/" target="_blank" className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
          Home page ↗
        </a>
      </div>

      {/* Add new category */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          void run("new", () => put({ action: "add", name: newName.trim(), image: newImage }), `${newName.trim()} added`).then(() => {
            setNewName("");
            setNewImage("");
          });
        }}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name (e.g. Fresh Fruits)"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none"
        />
        <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700">
          {newImage ? "✓ Image ready" : "📷 Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                setBusy("new");
                setNewImage(await uploadFile(f));
              } catch (err) {
                setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed" });
              } finally {
                setBusy(null);
              }
            }}
          />
        </label>
        <button disabled={busy === "new" || !newName.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40">
          + Add category
        </button>
      </form>

      {msg && <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-slate-200/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-[13px] text-slate-500">Add your first category above.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((c, i) => {
            const isBusy = busy === c.name;
            const shown = c.image || c.productImage || "/placeholder-product.png";
            return (
              <div key={c.name} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative aspect-[4/3] bg-emerald-50/50 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shown} alt={c.name} className="h-full w-full object-contain" />
                  {isBusy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[12px] font-semibold">Saving…</div>}
                  <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[10px] font-bold text-slate-600 shadow-sm">#{i + 1}</span>
                </div>
                <div className="space-y-1.5 p-2">
                  {editing === c.name ? (
                    <div className="space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50/40 p-1.5">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-[12px] font-semibold focus:border-emerald-500 focus:outline-none"
                        aria-label="Category name"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={!editName.trim() || editName.trim() === c.name || !!busy}
                          onClick={() =>
                            void run(c.name, () => put({ action: "rename", name: c.name, newName: editName.trim() }), `Renamed to ${editName.trim()}`).then((ok) => ok && setEditing(null))
                          }
                          className="flex-1 rounded-md bg-emerald-600 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                        >
                          Save name
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                          Cancel
                        </button>
                      </div>
                      <div className="border-t border-emerald-100 pt-1.5">
                        {c.count > 0 && (
                          <select
                            value={moveTo}
                            onChange={(e) => setMoveTo(e.target.value)}
                            className="mb-1 w-full rounded-md border border-slate-300 bg-white px-1 py-1 text-[11px]"
                            aria-label="Move products to"
                          >
                            <option value="">Move {c.count} products to…</option>
                            {rows
                              .filter((r) => r.name !== c.name)
                              .map((r) => (
                                <option key={r.name} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                        )}
                        <button
                          type="button"
                          disabled={!!busy || (c.count > 0 && !moveTo)}
                          onClick={() => {
                            const note = c.count > 0 ? ` Its ${c.count} products will move to "${moveTo}".` : "";
                            if (window.confirm(`Delete the "${c.name}" category?${note}`))
                              void run(c.name, () => put({ action: "remove", name: c.name, moveTo }), `${c.name} deleted`).then((ok) => ok && setEditing(null));
                          }}
                          className="w-full rounded-md bg-rose-50 py-1 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 disabled:opacity-40"
                        >
                          🗑 Delete category
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13px] font-semibold text-slate-900">{c.name}</span>
                      <span className={`shrink-0 text-[10px] ${c.count ? "text-slate-400" : "text-amber-600"}`}>{c.count} items</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c.name);
                          setEditName(c.name);
                          setMoveTo("");
                        }}
                        className="shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                        title="Rename or delete"
                      >
                        ✎ Edit
                      </button>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={i === 0 || !!busy}
                      onClick={() => move(i, -1)}
                      className="flex-1 rounded-lg border border-slate-200 py-1 text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                      aria-label={`Move ${c.name} left`}
                    >
                      ◀ Left
                    </button>
                    <button
                      type="button"
                      disabled={i === rows.length - 1 || !!busy}
                      onClick={() => move(i, 1)}
                      className="flex-1 rounded-lg border border-slate-200 py-1 text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                      aria-label={`Move ${c.name} right`}
                    >
                      Right ▶
                    </button>
                  </div>
                  <label className="block cursor-pointer rounded-lg bg-emerald-600 py-1.5 text-center text-[12px] font-bold text-white">
                    📷 Change image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isBusy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void run(c.name, async () => put({ action: "image", name: c.name, image: await uploadFile(f) }), `${c.name}: image updated`);
                      }}
                    />
                  </label>
                  <div className="flex justify-between text-[11px]">
                    {c.image ? (
                      <button disabled={isBusy} onClick={() => void run(c.name, () => put({ action: "image", name: c.name, image: "" }), `${c.name}: using product image`)} className="font-semibold text-slate-500">
                        Remove image
                      </button>
                    ) : (
                      <span className="text-slate-400">Product image</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
