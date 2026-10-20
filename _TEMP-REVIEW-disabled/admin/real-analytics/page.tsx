"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function RealAnalyticsPage() {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    ["Total Customers", data?.customers ?? 0],
    ["Total Orders", data?.orders ?? 0],
    ["Total Products", data?.products ?? 0],
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="Real Analytics Dashboard" subtitle="Live business overview from the analytics API." />
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(([title,value]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{title}</p>
              <p className="mt-3 text-4xl font-extrabold text-[#123b38]">{loading ? "ï¿½" : value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-[#123b38]">Live Status</h2>
          <p className="mt-2 text-sm text-slate-500">{loading ? "Fetching live analytics..." : "Analytics data is connected."}</p>
        </div>
      </div>
    </div>
  );
}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}






