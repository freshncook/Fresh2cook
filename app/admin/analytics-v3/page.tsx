"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AnalyticsV3Page() {
  const [inventory, setInventory] = useState<any>();
  const [segment, setSegment] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/inventory").then(r => r.json()),
      fetch("/api/analytics/segmentation").then(r => r.json()),
    ]).then(([a, b]) => {
      setInventory(a);
      setSegment(b);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    ["Products", inventory?.totalProducts ?? "—"],
    ["Stock", inventory?.totalStock ?? "—"],
    ["Customers", segment?.totalCustomers ?? "—"],
    ["VIP Customers", segment?.vipCustomers ?? "—"],
  ];

  return <AnalyticsShell title="Analytics V3" subtitle="Inventory and customer segmentation intelligence.">
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([title, value]) => <Kpi key={title} title={title} value={loading ? "…" : value} />)}
    </div>
    <Panel title="Analytics Status"><p className="text-sm text-slate-500">{loading ? "Loading live analytics..." : "Live analytics data loaded from the analytics APIs."}</p></Panel>
  </AnalyticsShell>;
}
function AnalyticsShell({ title, subtitle, children }: any) { return <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7"><div className="mx-auto max-w-[1600px]"><Header title={title} subtitle={subtitle}/>{children}</div></div>; }
function Header({ title, subtitle }: any) { return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>; }
function Kpi({ title, value }: any) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>; }
function Panel({ title, children }: any) { return <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md"><h2 className="font-extrabold text-[#123b38]">{title}</h2><div className="mt-4">{children}</div></div>; }









