"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStoreSettings } from "@/lib/use-store-settings";
import { repriceCart } from "@/lib/cart-reprice";
import { thumb } from "@/lib/img-url";

/*
 * Cart — compact, mobile first.
 * Product rows with picture, pack, price/MRP, quantity; bill summary; sticky "Proceed" bar.
 */

type CartItem = {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  qty: number;
  pack?: string;
  stock?: number;
  image?: string | null;
  category?: string;
};

const PLACEHOLDER = "/placeholder-product.png";
const rupees = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

function readCart(): CartItem[] {
  try {
    const c = JSON.parse(localStorage.getItem("freshcut-cart") || "[]");
    return Array.isArray(c) ? c.map((i: CartItem) => ({ ...i, qty: Math.max(1, Number(i.qty || 1)) })) : [];
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [catalog, setCatalog] = useState<{ id: number; price: number; mrp?: number; pack?: string }[]>([]);
  const [ready, setReady] = useState(false);
  const settings = useStoreSettings();

  useEffect(() => {
    const load = () => setItems(readCart());
    load();
    setReady(true);
    window.addEventListener("cartUpdated", load);
    window.addEventListener("storage", load);
    // Product pictures are not stored in the cart (keeps it small) — look them up
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        const map: Record<number, string> = {};
        for (const p of Array.isArray(list) ? list : []) if (p?.image) map[p.id] = p.image;
        setImages(map);
        setCatalog(Array.isArray(list) ? list : []);
      })
      .catch(() => undefined);
    return () => {
      window.removeEventListener("cartUpdated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Keep cart prices up to date with today's shop price
  useEffect(() => {
    if (!settings.ready || !catalog.length || !items.length) return;
    const r = repriceCart(items, catalog, settings);
    if (r.changed) save(r.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, settings, items]);

  function save(next: CartItem[]) {
    localStorage.setItem("freshcut-cart", JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function setQty(index: number, qty: number) {
    const next = [...items];
    const item = next[index];
    const stock = Number(item.stock || 0);
    if (qty < 1) {
      next.splice(index, 1);
    } else {
      next[index] = { ...item, qty: stock > 0 ? Math.min(qty, stock) : qty };
    }
    save(next);
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * i.qty, 0);
    const mrpTotal = items.reduce((s, i) => s + Math.max(Number(i.mrp || 0), Number(i.price || 0)) * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const handling = subtotal > 0 ? settings.handlingCharge : 0;
    const delivery = subtotal >= settings.freeDeliveryTarget || subtotal === 0 ? 0 : settings.deliveryCharge;
    const total = subtotal + handling + delivery;
    const saving = Math.max(0, mrpTotal - subtotal) + (subtotal >= settings.freeDeliveryTarget ? settings.deliveryCharge : 0);
    const remaining = Math.max(0, settings.freeDeliveryTarget - subtotal);
    return { subtotal, mrpTotal, count, handling, delivery, total, saving, remaining };
  }, [items, settings]);

  function proceed() {
    try {
      localStorage.setItem("freshcut-subtotal", String(totals.subtotal));
      localStorage.setItem("freshcut-handling", String(totals.handling));
      localStorage.setItem("freshcut-delivery", String(totals.delivery));
      localStorage.setItem("freshcut-total", String(totals.total));
      localStorage.setItem("freshcut-items", String(totals.count));
    } catch {
      /* ignore */
    }
    window.location.href = "/payment";
  }

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-2 text-[18px] font-extrabold text-slate-900">Your cart is empty</h1>
        <p className="mt-1 text-[13px] text-slate-500">Add fresh vegetables and fruits to get started.</p>
        <Link href="/products" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-[14px] font-bold text-white">
          Shop now
        </Link>
      </div>
    );
  }

  const pct = Math.min(100, (totals.subtotal / Math.max(1, settings.freeDeliveryTarget)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-8">
      <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-4">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-[17px] font-extrabold text-slate-900">
            My cart <span className="text-[12px] font-semibold text-slate-500">· {totals.count} items</span>
          </h1>
          <Link href="/products" className="text-[12px] font-bold text-emerald-700">
            + Add more
          </Link>
        </div>

        {/* Free delivery progress */}
        <div className="mb-2 rounded-xl border border-emerald-100 bg-white px-3 py-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-slate-700">
              {totals.remaining > 0 ? (
                <>
                  Add <b className="text-emerald-700">{rupees(totals.remaining)}</b> more for FREE delivery
                </>
              ) : (
                <b className="text-emerald-700">🎉 FREE delivery unlocked</b>
              )}
            </span>
            <span className="text-[11px] text-slate-400">{rupees(settings.freeDeliveryTarget)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Items */}
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {items.map((item, i) => {
              const img = thumb((item.image && !String(item.image).startsWith("data:") ? item.image : "") || images[item.id], 160) || PLACEHOLDER;
              const mrp = Number(item.mrp || 0) > Number(item.price) ? Number(item.mrp) : 0;
              return (
                <div key={`${item.id}-${item.pack}-${i}`} className="flex items-center gap-2.5 px-2.5 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain"
                    onError={(e) => {
                      if (!e.currentTarget.src.endsWith(PLACEHOLDER)) e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-slate-900">{item.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                      {item.pack && <span className="rounded bg-slate-100 px-1 font-bold text-slate-600">{item.pack}</span>}
                      <span className="font-extrabold text-slate-900">{rupees(item.price)}</span>
                      {mrp > 0 && <span className="font-bold text-slate-400 line-through decoration-red-500 decoration-2">{rupees(mrp)}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex items-center overflow-hidden rounded-lg bg-emerald-600 text-white">
                      <button onClick={() => setQty(i, item.qty - 1)} className="h-7 w-7 text-[15px] font-extrabold" aria-label={`Less ${item.name}`}>
                        −
                      </button>
                      <span className="w-6 text-center text-[12px] font-extrabold">{item.qty}</span>
                      <button onClick={() => setQty(i, item.qty + 1)} className="h-7 w-7 text-[15px] font-extrabold" aria-label={`More ${item.name}`}>
                        +
                      </button>
                    </div>
                    <span className="text-[12px] font-extrabold tabular-nums text-slate-900">{rupees(item.price * item.qty)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bill */}
          <aside className="h-fit space-y-2 lg:sticky lg:top-24">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-[12px]">
              <h2 className="mb-1.5 text-[13px] font-extrabold text-slate-900">Bill details</h2>
              <Row label="Items total (MRP)" value={rupees(totals.mrpTotal)} muted />
              <Row label="Product discount" value={`− ${rupees(Math.max(0, totals.mrpTotal - totals.subtotal))}`} green />
              <Row label="Handling charge" value={rupees(totals.handling)} />
              <Row label="Delivery charge" value={totals.delivery === 0 ? "FREE" : rupees(totals.delivery)} green={totals.delivery === 0} />
              <div className="mt-1.5 flex items-center justify-between border-t border-dashed border-slate-200 pt-1.5 text-[14px] font-extrabold text-slate-900">
                <span>To pay</span>
                <span>{rupees(totals.total)}</span>
              </div>
              {totals.saving > 0 && (
                <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1 text-center text-[11px] font-bold text-emerald-700">
                  You are saving {rupees(totals.saving)} on this order
                </div>
              )}
              <p className="mt-1.5 text-[10px] text-slate-400">Wallet balance can be used on the next page.</p>
            </div>
            <button
              onClick={proceed}
              className="hidden w-full rounded-xl bg-emerald-600 py-3 text-[14px] font-extrabold text-white shadow-sm hover:bg-emerald-700 lg:block"
            >
              Proceed to pay {rupees(totals.total)} →
            </button>
          </aside>
        </div>
      </div>

      {/* Sticky bar — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <button onClick={proceed} className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg">
          <span className="text-left leading-tight">
            <span className="block text-[15px] font-extrabold">{rupees(totals.total)}</span>
            <span className="text-[10px] font-semibold opacity-90">{totals.count} items · TOTAL</span>
          </span>
          <span className="text-[14px] font-extrabold">Proceed to pay →</span>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, muted, green }: { label: string; value: string; muted?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold tabular-nums ${green ? "text-emerald-700" : muted ? "text-slate-500" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
