"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AnalyticsV4Page() {
  const [repeat, setRepeat] = useState<any>();
  const [churn, setChurn] = useState<any>();
  const [trend, setTrend] = useState<any>();

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/repeat-customers").then(r => r.json()),
      fetch("/api/analytics/churn-risk").then(r => r.json()),
      fetch("/api/analytics/revenue-trends").then(r => r.json()),
    ]).then(([a,b,c]) => {
      setRepeat(a); setChurn(b); setTrend(c);
    }).catch(() => {});
  }, []);

  return (
    <Shell title="Executive Analytics V4" subtitle="Repeat customer, churn and revenue intelligence.">
      <div className="grid gap-5 md:grid-cols-3">
        <Kpi title="Repeat Customers" value={repeat?.repeatCustomers ?? "—"} />
        <Kpi title="Churn Risk" value={churn?.churnRisk ?? "—"} />
        <Kpi title="Total Customers" value={repeat?.totalCustomers ?? "—"} />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <h2 className="font-extrabold text-[#123b38]">Revenue Trends</h2>
        <div className="mt-5 space-y-3">
          {trend?.trend?.map((item: any, index: number) => (
            <div key={index} className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm">
              <span className="font-semibold text-slate-600">{item.month}</span>
              <strong className="text-[#123b38]">₹{item.value}</strong>
            </div>
          )) || <p className="text-sm text-slate-500">No trend data available.</p>}
        </div>
      </div>
    </Shell>
  );
}
function Shell({title,subtitle,children}:any){return <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7"><div className="mx-auto max-w-[1600px]"><Header title={title} subtitle={subtitle}/>{children}</div></div>}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}
function Kpi({title,value}:any){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md"><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>}










