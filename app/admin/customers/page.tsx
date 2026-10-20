"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/*
 * Admin > Customers — real data from orders, customer accounts and wallet.
 */

type Customer = {
  phone: string;
  name: string;
  address: string | null;
  orders: number;
  delivered: number;
  cancelled: number;
  spent: number;
  firstOrder: string | null;
  lastOrder: string | null;
  hasAccount: boolean;
  joinedAt: string | null;
  referralCode: string | null;
  wallet: number;
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const day = (v: string | null) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—");

const FILTERS = ["All", "Repeat", "One order", "Account", "No order yet", "Inactive 30d"] as const;

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/customers-list", { cache: "no-store" });
      if (r.status === 401) {
        setNeedsLogin(true);
        return;
      }
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      setRows(j.customers || []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const buyers = rows.filter((r) => r.orders > 0);
    const repeat = buyers.filter((r) => r.orders > 1).length;
    const spent = rows.reduce((s, r) => s + r.spent, 0);
    const delivered = rows.reduce((s, r) => s + r.delivered, 0);
    const monthAgo = Date.now() - 30 * 86400000;
    return {
      total: rows.length,
      repeat,
      repeatPct: buyers.length ? Math.round((repeat / buyers.length) * 100) : 0,
      spent,
      aov: delivered ? Math.round(spent / delivered) : 0,
      accounts: rows.filter((r) => r.hasAccount).length,
      active30: rows.filter((r) => r.lastOrder && new Date(r.lastOrder).getTime() > monthAgo).length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    const monthAgo = Date.now() - 30 * 86400000;
    return rows.filter((r) => {
      const okQ = !k || r.name.toLowerCase().includes(k) || r.phone.includes(k) || String(r.address || "").toLowerCase().includes(k);
      const okF =
        filter === "All" ||
        (filter === "Repeat" && r.orders > 1) ||
        (filter === "One order" && r.orders === 1) ||
        (filter === "Account" && r.hasAccount) ||
        (filter === "No order yet" && r.orders === 0) ||
        (filter === "Inactive 30d" && r.orders > 0 && (!r.lastOrder || new Date(r.lastOrder).getTime() < monthAgo));
      return okQ && okF;
    });
  }, [rows, q, filter]);

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center">
        <div className="text-2xl">🔒</div>
        <h1 className="mt-1 text-base font-bold">Admin login required</h1>
        <a href="/admin/login?next=/admin/customers" className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white">
          Admin login
        </a>
      </div>
    );
  }

  const tiles = [
    { label: "Customers", value: stats.total.toLocaleString("en-IN"), sub: `${stats.accounts} with account` },
    { label: "Repeat buyers", value: String(stats.repeat), sub: `${stats.repeatPct}% of buyers` },
    { label: "Delivered value", value: rupees(stats.spent), sub: `Avg ${rupees(stats.aov)} / order` },
    { label: "Active (30 days)", value: String(stats.active30), sub: "ordered in last 30 days" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Customers</h1>
          <p className="text-[11px] text-slate-500">From orders and customer accounts — one customer per mobile number</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="h-[76px] rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t.label}</div>
            <div className="text-lg font-bold tabular-nums text-slate-900">{loading ? "…" : t.value}</div>
            <div className="truncate text-[10px] text-slate-500">{t.sub}</div>
          </div>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, mobile, address…"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${filter === f ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200/60" />
      ) : shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-[13px] text-slate-500">No customers found.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2 text-right">Orders</th>
                  <th className="px-3 py-2 text-right">Spent</th>
                  <th className="px-3 py-2">Last order</th>
                  <th className="px-3 py-2 text-right">Wallet</th>
                  <th className="px-3 py-2">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((r) => (
                  <tr key={r.phone} className="align-top hover:bg-slate-50/60">
                    <td className="max-w-[320px] px-3 py-2">
                      <Link href={`/admin/customers/${r.phone}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-slate-500">{r.phone}</div>
                      {r.address && <div className="truncate text-[11px] text-slate-400" title={r.address}>{r.address}</div>}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.orders}
                      {r.cancelled > 0 && <div className="text-[10px] text-rose-500">{r.cancelled} cancelled</div>}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{rupees(r.spent)}</td>
                    <td className="px-3 py-2 text-slate-600">{day(r.lastOrder)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{r.wallet ? rupees(r.wallet) : "—"}</td>
                    <td className="px-3 py-2">
                      {r.hasAccount ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Yes · {r.referralCode}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Guest</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {shown.map((r) => (
              <li key={r.phone} className="rounded-xl border border-slate-200 bg-white p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/admin/customers/${r.phone}`} className="text-[13px] font-semibold text-slate-900">
                      {r.name}
                    </Link>
                    <div className="text-[11px] text-slate-500">
                      {r.phone} · {r.hasAccount ? "Account" : "Guest"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold tabular-nums">{rupees(r.spent)}</div>
                    <div className="text-[10px] text-slate-500">{r.orders} orders · {day(r.lastOrder)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
