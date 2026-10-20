"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

/*
 * Fresh2Cook Admin — Live Dashboard
 * All numbers come from /api/admin/dashboard-live (real database data).
 * Compact, mobile-first layout: the "Needs attention" actions and the
 * four key numbers sit above the fold on a phone.
 */

export type DashboardLinks = {
  orders?: string | null;
  processing?: string | null;
  delivery?: string | null;
  riders?: string | null;
  inventory?: string | null;
  customers?: string | null;
};

type DashboardData = {
  generatedAt: string;
  kpis: {
    ordersToday: number;
    ordersChange: number | null;
    revenueToday: number;
    revenueChange: number | null;
    totalCustomers: number;
    newCustomersToday: number;
    activeDeliveries: number;
    ridersOnline: number;
  };
  attention: {
    waitingToAccept: number;
    readyNoRider: number;
    lateOrders: number;
    ridersPending: number;
    lowStock: number;
  };
  trend: { date: string; label: string; orders: number; revenue: number }[];
  pipeline: {
    new: number;
    processing: number;
    ready: number;
    onTheWay: number;
    delivered: number;
    cancelled: number;
  };
  recent: {
    id: number;
    customer: string;
    items: number;
    amount: number;
    status: string;
    createdAt: string;
    rider: string | null;
  }[];
  activity: { at: string; type: string; text: string }[];
};

const rupees = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const timeIST = (value: string) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Confirmed: "bg-amber-50 text-amber-700 ring-amber-200",
  Paid: "bg-amber-50 text-amber-700 ring-amber-200",
  "Payment Received": "bg-amber-50 text-amber-700 ring-amber-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  "Ready For Dispatch": "bg-violet-50 text-violet-700 ring-violet-200",
  "Assigned To Rider": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Out For Delivery": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const PIPELINE = [
  { key: "new", label: "New", color: "bg-amber-400" },
  { key: "processing", label: "Processing", color: "bg-blue-500" },
  { key: "ready", label: "Ready", color: "bg-violet-500" },
  { key: "onTheWay", label: "On the way", color: "bg-cyan-500" },
  { key: "delivered", label: "Delivered today", color: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled today", color: "bg-rose-400" },
] as const;

function MaybeLink({
  href,
  className,
  children,
}: {
  href?: string | null;
  className: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

function Change({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] font-semibold text-emerald-600">New</span>;
  }
  if (value === 0) {
    return <span className="text-[11px] font-medium text-slate-400">same as yday</span>;
  }
  const up = value > 0;
  return (
    <span className={`text-[11px] font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}% <span className="font-normal text-slate-400">vs yday</span>
    </span>
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
      <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        {action}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

export default function AdminLiveDashboard({ links = {} }: { links?: DashboardLinks }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/dashboard-live", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not load dashboard");
      setData(json);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (!data && !error) {
    return (
      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[84px] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          <span>Could not load dashboard: {error}</span>
          <button onClick={() => void load()} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, attention, trend, pipeline, recent, activity } = data;
  const maxOrders = Math.max(1, ...trend.map((d) => d.orders));
  const weekOrders = trend.reduce((s, d) => s + d.orders, 0);
  const weekRevenue = trend.reduce((s, d) => s + d.revenue, 0);
  const pipelineTotal = PIPELINE.reduce((s, p) => s + pipeline[p.key], 0);

  const attentionItems = [
    { count: attention.waitingToAccept, label: "New orders to accept", href: links.processing, tone: "amber" },
    { count: attention.lateOrders, label: "Late in processing", href: links.processing, tone: "rose" },
    { count: attention.readyNoRider, label: "Ready, assign rider", href: links.processing || links.delivery, tone: "violet" },
    { count: attention.ridersPending, label: "Riders to approve", href: links.riders, tone: "blue" },
    { count: attention.lowStock, label: "Low stock items", href: links.inventory, tone: "slate" },
  ].filter((item) => item.count > 0);

  const toneClass: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  const kpiCards = [
    {
      label: "Orders today",
      value: kpis.ordersToday.toLocaleString("en-IN"),
      foot: <Change value={kpis.ordersChange} />,
      href: links.orders,
    },
    {
      label: "Revenue today",
      value: rupees(kpis.revenueToday),
      foot: <Change value={kpis.revenueChange} />,
      href: links.orders,
    },
    {
      label: "Customers",
      value: kpis.totalCustomers.toLocaleString("en-IN"),
      foot: (
        <span className="text-[11px] text-slate-500">
          <b className="font-semibold text-emerald-600">+{kpis.newCustomersToday}</b> new today
        </span>
      ),
      href: links.customers,
    },
    {
      label: "Active deliveries",
      value: kpis.activeDeliveries.toLocaleString("en-IN"),
      foot: (
        <span className="text-[11px] text-slate-500">
          <b className="font-semibold text-slate-700">{kpis.ridersOnline}</b> riders online
        </span>
      ),
      href: links.delivery,
    },
  ];

  return (
    <div className="space-y-3 p-3 pb-6 sm:p-4">
      {/* Top line: what this page is + freshness */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-slate-900">Today&apos;s overview</h1>
          <p className="text-[11px] text-slate-500">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
            {" · "}
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · updated {timeIST(data.generatedAt)}
            </span>
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={refreshing}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] text-rose-700">
          Last refresh failed: {error}. Showing previous numbers.
        </div>
      )}

      {/* Needs attention — the primary actions */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
        {attentionItems.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-800">
            ✓ All clear — nothing waiting right now
          </div>
        ) : (
          attentionItems.map((item) => (
            <MaybeLink
              key={item.label}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium ${toneClass[item.tone]} ${item.href ? "hover:brightness-95" : ""}`}
            >
              <span className="text-[15px] font-bold tabular-nums">{item.count}</span>
              <span className="whitespace-nowrap">{item.label}</span>
              {item.href && <span aria-hidden>›</span>}
            </MaybeLink>
          ))
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <MaybeLink
            key={card.label}
            href={card.href}
            className="flex h-[84px] flex-col justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{card.label}</span>
            <span className="truncate text-xl font-bold leading-none tabular-nums text-slate-900">{card.value}</span>
            {card.foot}
          </MaybeLink>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 7-day trend */}
        <Card
          title="Orders · last 7 days"
          className="lg:col-span-2"
          action={
            <span className="text-[11px] text-slate-500">
              <b className="font-semibold text-slate-700">{weekOrders}</b> orders · {rupees(weekRevenue)}
            </span>
          }
        >
          {weekOrders === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No orders in the last 7 days yet.</p>
          ) : (
            <div className="flex h-36 items-end gap-1.5 sm:gap-3">
              {trend.map((day) => {
                const isToday = day.label === "Today";
                const height = Math.max(4, Math.round((day.orders / maxOrders) * 100));
                return (
                  <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${day.orders} orders · ${rupees(day.revenue)}`}>
                    <span className="text-[11px] font-semibold tabular-nums text-slate-700">{day.orders}</span>
                    <div
                      className={`w-full max-w-[38px] rounded-t-md ${isToday ? "bg-emerald-600" : "bg-emerald-200"}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className={`text-[10px] ${isToday ? "font-semibold text-emerald-700" : "text-slate-500"}`}>{day.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Live order status */}
        <Card
          title="Live order status"
          action={<span className="text-[11px] text-slate-500">{pipelineTotal} total</span>}
        >
          <div className="mb-2.5 flex h-2 overflow-hidden rounded-full bg-slate-100">
            {pipelineTotal > 0 &&
              PIPELINE.map((p) =>
                pipeline[p.key] > 0 ? (
                  <div key={p.key} className={p.color} style={{ width: `${(pipeline[p.key] / pipelineTotal) * 100}%` }} />
                ) : null
              )}
          </div>
          <ul className="space-y-1">
            {PIPELINE.map((p) => (
              <li key={p.key} className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${p.color}`} />
                  {p.label}
                </span>
                <span className="font-semibold tabular-nums text-slate-900">{pipeline[p.key]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Recent orders */}
        <Card
          title="Recent orders"
          className="lg:col-span-2"
          action={
            links.orders ? (
              <Link href={links.orders} className="text-[12px] font-semibold text-emerald-700 hover:underline">
                View all
              </Link>
            ) : undefined
          }
        >
          {recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No orders yet.</p>
          ) : (
            <ul className="-my-1 divide-y divide-slate-100">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-2">
                  <div className="w-12 shrink-0 text-[12px] font-semibold tabular-nums text-slate-500">#{order.id}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-slate-900">{order.customer}</div>
                    <div className="truncate text-[11px] text-slate-500">
                      {order.items} item{order.items === 1 ? "" : "s"} · {timeIST(order.createdAt)}
                      {order.rider ? ` · 🛵 ${order.rider}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[13px] font-semibold tabular-nums text-slate-900">{rupees(order.amount)}</div>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-1.5 py-px text-[10px] font-semibold ring-1 ring-inset ${
                        STATUS_STYLE[order.status] || "bg-slate-50 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Today's activity */}
        <Card title="Today's activity">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No activity yet today.</p>
          ) : (
            <ol className="relative space-y-2.5 border-l border-slate-200 pl-3">
              {activity.map((event, index) => (
                <li key={`${event.at}-${index}`} className="relative">
                  <span
                    className={`absolute -left-[17px] top-1 h-2 w-2 rounded-full ring-2 ring-white ${
                      event.type === "delivered" ? "bg-emerald-500" : event.type === "assign" ? "bg-cyan-500" : "bg-amber-400"
                    }`}
                  />
                  <p className="text-[12px] leading-snug text-slate-800">{event.text}</p>
                  <p className="text-[10px] text-slate-400">{timeIST(event.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
