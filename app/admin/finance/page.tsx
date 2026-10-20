"use client";

import { useEffect, useMemo, useState } from "react";

/*
 * Admin > Finance — profit / loss from delivered orders.
 * Purchase rate of each product is set in Admin > Products (admin only).
 */

type Totals = {
  orders: number;
  openOrders: number;
  openValue: number;
  cancelled: number;
  sales: number;
  itemSales: number;
  charges: number;
  productCost: number;
  riderPay: number;
  staffReward: number;
  walletUsed: number;
  profit: number;
  margin: number;
  salesWithoutCost: number;
  productsWithoutCost: number;
  avgOrder: number;
};
type Day = { date: string; orders: number; sales: number; cost: number; profit: number };
type Prod = { id: number; name: string; category: string; qty: number; sales: number; cost: number; profit: number | null; missing: boolean };

const rupees = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(Math.round(Number(n || 0))).toLocaleString("en-IN")}`;
const istToday = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
const shift = (iso: string, days: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + days * 86400000).toISOString().slice(0, 10);

const RANGES: { key: string; label: string; get: () => [string, string] }[] = [
  { key: "today", label: "Today", get: () => [istToday(), istToday()] },
  { key: "7", label: "Last 7 days", get: () => [shift(istToday(), -6), istToday()] },
  { key: "month", label: "This month", get: () => [istToday().slice(0, 8) + "01", istToday()] },
  {
    key: "last",
    label: "Last month",
    get: () => {
      const first = istToday().slice(0, 8) + "01";
      const end = shift(first, -1);
      return [end.slice(0, 8) + "01", end];
    },
  },
  { key: "30", label: "Last 30 days", get: () => [shift(istToday(), -29), istToday()] },
];

export default function FinancePage() {
  const [range, setRange] = useState("month");
  const [[from, to], setDates] = useState<[string, string]>(RANGES[2].get());
  const [data, setData] = useState<{ totals: Totals; days: Day[]; products: Prod[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetch(`/api/admin/finance?from=${from}&to=${to}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.error || "Could not load");
        if (alive) setData(j);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not load"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [from, to]);

  const t = data?.totals;
  const maxDay = useMemo(() => Math.max(1, ...(data?.days || []).map((d) => Math.max(d.sales, Math.abs(d.profit)))), [data]);
  const prods = (data?.products || []).filter((p) => !onlyMissing || p.missing);

  function exportCsv() {
    if (!data) return;
    const rows = [["Product", "Category", "Qty", "Sales", "Purchase cost", "Profit"], ...data.products.map((p) => [p.name, p.category, p.qty, p.sales, p.missing ? "" : p.cost, p.profit ?? "no purchase rate"])];
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `fresh2cook-profit-${from}-to-${to}.csv`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3 pb-10">
      {/* Header + range */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">💹 Finance · Profit &amp; Loss</h1>
          <p className="text-[11px] text-slate-500">Delivered orders only · purchase rate from Admin › Products · admin only</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRange(r.key);
                setDates(r.get());
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${range === r.key ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-200"}`}
            >
              {r.label}
            </button>
          ))}
          <input type="date" value={from} max={to} onChange={(e) => (setRange("custom"), setDates([e.target.value, to]))} className="rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-[11px]" />
          <span className="text-[11px] text-slate-400">to</span>
          <input type="date" value={to} min={from} onChange={(e) => (setRange("custom"), setDates([from, e.target.value]))} className="rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-[11px]" />
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}
      {!t && !error && <div className="h-40 animate-pulse rounded-xl bg-slate-200/60" />}

      {t && (
        <>
          {/* Profit hero */}
          <div className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-md ${t.profit >= 0 ? "bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500" : "bg-gradient-to-br from-rose-700 via-rose-600 to-orange-500"}`}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{t.profit >= 0 ? "Net profit" : "Net loss"}</div>
                <div className="text-[32px] font-black leading-none tabular-nums">{rupees(t.profit)}</div>
                <div className="mt-1 text-[12px] font-semibold text-white/90">
                  Margin {t.margin}% · {t.orders} delivered orders · avg order {rupees(t.avgOrder)} {loading && "· updating…"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                {[
                  ["Sales", t.sales],
                  ["Product cost", -t.productCost],
                  ["Rider + staff", -(t.riderPay + t.staffReward)],
                  ["Wallet used", -t.walletUsed],
                ].map(([l, v]) => (
                  <div key={String(l)} className="rounded-xl bg-white/15 px-2.5 py-1.5 ring-1 ring-white/20">
                    <div className="text-white/80">{l}</div>
                    <div className="text-[15px] font-extrabold tabular-nums">{rupees(Number(v))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {t.productsWithoutCost > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
              <span>
                ⚠️ <b>{t.productsWithoutCost} products</b> sold without a purchase rate ({rupees(t.salesWithoutCost)} sales). Their cost is counted as ₹0, so profit looks higher than real.
              </span>
              <a href="/admin/products-manage" className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white">
                Add purchase rates →
              </a>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* P&L statement */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold text-slate-800">📒 Profit &amp; loss statement</header>
              <div className="divide-y divide-slate-100 text-[12px]">
                <PL label="Product sales" value={t.itemSales} />
                <PL label="Handling + delivery charges collected" value={t.charges} />
                <PL label="Total sales (customer paid)" value={t.sales} bold />
                <PL label="Purchase cost of products sold" value={-t.productCost} />
                <PL label="Gross profit" value={t.sales - t.productCost} bold tone />
                <PL label="Rider pay (per delivery)" value={-t.riderPay} />
                <PL label="Processing staff reward" value={-t.staffReward} />
                <PL label="Wallet / referral money used by customers" value={-t.walletUsed} />
                <PL label={t.profit >= 0 ? "Net profit" : "Net loss"} value={t.profit} bold tone big />
              </div>
              <p className="px-3 py-2 text-[10px] text-slate-400">Monthly staff salaries, rent, packing material and other expenses are not included here.</p>
            </section>

            {/* side cards */}
            <div className="space-y-3">
              <section className="grid grid-cols-2 gap-2">
                <Mini label="Open orders" value={String(t.openOrders)} sub={rupees(t.openValue) + " not delivered yet"} />
                <Mini label="Cancelled" value={String(t.cancelled)} sub="not counted" />
              </section>
              <section className="rounded-xl border border-slate-200 bg-white">
                <header className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold text-slate-800">📅 Day by day</header>
                <ul className="max-h-[320px] space-y-1 overflow-auto p-2.5 text-[11px]">
                  {data!.days
                    .slice()
                    .reverse()
                    .map((d) => (
                      <li key={d.date} className="flex items-center gap-2">
                        <span className="w-12 shrink-0 text-slate-500">{d.date.slice(5).split("-").reverse().join("/")}</span>
                        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-200" style={{ width: `${(d.sales / maxDay) * 100}%` }} />
                          <div className={`absolute inset-y-0 left-0 rounded-full ${d.profit >= 0 ? "bg-emerald-600" : "bg-rose-500"}`} style={{ width: `${(Math.abs(d.profit) / maxDay) * 100}%` }} />
                        </div>
                        <span className="w-14 shrink-0 text-right tabular-nums text-slate-600">{rupees(d.sales)}</span>
                        <span className={`w-14 shrink-0 text-right font-bold tabular-nums ${d.profit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{rupees(d.profit)}</span>
                      </li>
                    ))}
                </ul>
                <div className="flex gap-3 border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-500">
                  <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-200" />Sales</span>
                  <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />Profit</span>
                </div>
              </section>
            </div>
          </div>

          {/* product table */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
              <span className="text-[13px] font-extrabold text-slate-800">🥕 Product-wise profit</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-slate-600">
                  <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} /> Only without purchase rate
                </label>
                <button onClick={exportCsv} className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700">
                  ⬇ Excel (CSV)
                </button>
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-1.5">Product</th>
                    <th className="px-2 py-1.5 text-right">Qty</th>
                    <th className="px-2 py-1.5 text-right">Sales</th>
                    <th className="px-2 py-1.5 text-right">Cost</th>
                    <th className="px-2 py-1.5 text-right">Profit</th>
                    <th className="px-3 py-1.5 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-3 py-1.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{p.qty}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{rupees(p.sales)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{p.missing ? <span className="rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-800">no rate</span> : rupees(p.cost)}</td>
                      <td className={`px-2 py-1.5 text-right font-extrabold tabular-nums ${p.profit === null ? "text-slate-400" : p.profit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {p.profit === null ? "—" : rupees(p.profit)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-[11px] tabular-nums text-slate-600">
                        {p.profit === null || !p.sales ? "—" : `${Math.round((p.profit / p.sales) * 100)}%`}
                      </td>
                    </tr>
                  ))}
                  {!prods.length && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                        No delivered orders in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function PL({ label, value, bold, tone, big }: { label: string; value: number; bold?: boolean; tone?: boolean; big?: boolean }) {
  const color = tone ? (value >= 0 ? "text-emerald-700" : "text-rose-600") : value < 0 ? "text-rose-600" : "text-slate-800";
  return (
    <div className={`flex items-center justify-between px-3 ${big ? "bg-slate-50 py-2.5" : "py-1.5"}`}>
      <span className={bold ? "font-extrabold text-slate-900" : "text-slate-600"}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-black" : "font-semibold"} ${big ? "text-[16px]" : ""} ${color}`}>{rupees(value)}</span>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[18px] font-black text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
