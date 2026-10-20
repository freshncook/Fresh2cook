"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

/*
 * Admin > Orders — compact board with Delivery OTP column and rider assign.
 * Data: /api/admin/orders-board (admin login required).
 */

type Rider = { id: number; name: string; mobile: string; status: string };
type Order = {
  id: number;
  customer: string;
  phone: string | null;
  address: string | null;
  amount: number;
  status: string;
  otp: string | null;
  items: number;
  processingStep: number;
  createdAt: string;
  rider: { id: number; name: string; status: string } | null;
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const when = (v: string) =>
  new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const STATUS_CLS: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Confirmed: "bg-amber-50 text-amber-700 ring-amber-200",
  Paid: "bg-amber-50 text-amber-700 ring-amber-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  "Ready For Dispatch": "bg-violet-50 text-violet-700 ring-violet-200",
  "Assigned To Rider": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Picked Up": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Out For Delivery": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const ACTIVE_OTP = ["Assigned To Rider", "Picked Up", "Out For Delivery"];

function Status({ value }: { value: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CLS[value] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {value}
    </span>
  );
}

function Otp({ order }: { order: Order }) {
  if (!order.otp) return <span className="text-slate-300">—</span>;
  const live = ACTIVE_OTP.includes(order.status);
  return (
    <button
      type="button"
      title="Copy OTP"
      onClick={() => void navigator.clipboard?.writeText(order.otp || "")}
      className={`rounded-md px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-widest ${
        live ? "bg-amber-100 text-amber-900" : order.status === "Delivered" ? "bg-slate-100 text-slate-400 line-through" : "bg-slate-100 text-slate-700"
      }`}
    >
      {order.otp}
    </button>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Active");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/orders-board", { cache: "no-store" });
      if (r.status === 401) {
        setNeedsLogin(true);
        return;
      }
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      setOrders(j.orders || []);
      setRiders(j.riders || []);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, [load]);

  async function assign(order: Order, riderId: number) {
    if (!riderId) return;
    setBusyId(order.id);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/orders-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, riderId }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || "Assign failed");
      setMsg({ ok: true, text: j.message });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Assign failed" });
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    const c = { All: orders.length, Active: 0, "Out for delivery": 0, Delivered: 0, Cancelled: 0 };
    for (const o of orders) {
      if (o.status === "Delivered") c.Delivered++;
      else if (o.status === "Cancelled") c.Cancelled++;
      else c.Active++;
      if (ACTIVE_OTP.includes(o.status)) c["Out for delivery"]++;
    }
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return orders.filter((o) => {
      const okFilter =
        filter === "All" ||
        (filter === "Active" && !["Delivered", "Cancelled"].includes(o.status)) ||
        (filter === "Out for delivery" && ACTIVE_OTP.includes(o.status)) ||
        o.status === filter;
      const okSearch =
        !k ||
        String(o.id).includes(k) ||
        o.customer.toLowerCase().includes(k) ||
        String(o.phone || "").includes(k) ||
        String(o.address || "").toLowerCase().includes(k) ||
        String(o.rider?.name || "").toLowerCase().includes(k);
      return okFilter && okSearch;
    });
  }, [orders, search, filter]);

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center">
        <div className="text-2xl">🔒</div>
        <h1 className="mt-1 text-base font-bold">Admin login required</h1>
        <p className="text-[12px] text-slate-500">Log in as admin to see orders and OTPs.</p>
        <a href="/admin/login?next=/admin/orders" className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white">
          Admin login
        </a>
      </div>
    );
  }

  const riderSelect = (o: Order) => {
    const locked = ["Delivered", "Cancelled"].includes(o.status) || ["Picked Up", "Otp Sent", "Out For Delivery"].includes(o.rider?.status || "");
    if (locked) return <span className="text-[12px] font-medium text-slate-700">{o.rider ? `🛵 ${o.rider.name}` : "—"}</span>;
    return (
      <select
        value=""
        disabled={busyId === o.id}
        onChange={(e) => void assign(o, Number(e.target.value))}
        className="w-full max-w-[170px] rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-800 disabled:opacity-50"
        aria-label={`Assign rider to order ${o.id}`}
      >
        <option value="">{busyId === o.id ? "Saving…" : o.rider ? `🛵 ${o.rider.name} · change` : "Assign rider"}</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} · {r.status}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Orders</h1>
          <p className="text-[11px] text-slate-500">OTP is visible only to admin · yellow OTP = rider on the way</p>
        </div>
        <div className="flex gap-2">
          <Link href="/processing/dashboard" className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
            Processing →
          </Link>
          <button onClick={() => void load()} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, customer, mobile, address, rider…"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${
              filter === k ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {k} <span className="opacity-60">{counts[k]}</span>
          </button>
        ))}
      </div>

      {msg && <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200/60" />
      ) : shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-[13px] text-slate-500">No orders here.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2 text-right">Items</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">OTP</th>
                  <th className="px-3 py-2">Rider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((o) => (
                  <tr key={o.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-3 py-2">
                      <div className="font-bold text-slate-900">#{o.id}</div>
                      <div className="text-[10px] text-slate-500">{when(o.createdAt)}</div>
                    </td>
                    <td className="max-w-[260px] px-3 py-2">
                      <div className="font-semibold text-slate-900">{o.customer}</div>
                      <div className="text-[11px] text-slate-500">{o.phone || "-"}</div>
                      <div className="truncate text-[11px] text-slate-400" title={o.address || ""}>{o.address}</div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{o.items}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{rupees(o.amount)}</td>
                    <td className="px-3 py-2"><Status value={o.status} /></td>
                    <td className="px-3 py-2"><Otp order={o} /></td>
                    <td className="px-3 py-2">{riderSelect(o)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {shown.map((o) => (
              <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold">#{o.id}</span>
                      <Status value={o.status} />
                    </div>
                    <div className="truncate text-[12px] font-semibold">{o.customer} <span className="font-normal text-slate-500">{o.phone}</span></div>
                    <div className="text-[10px] text-slate-500">{when(o.createdAt)} · {o.items} items</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold tabular-nums">{rupees(o.amount)}</div>
                    <div className="mt-0.5"><Otp order={o} /></div>
                  </div>
                </div>
                <div className="mt-1.5">{riderSelect(o)}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
