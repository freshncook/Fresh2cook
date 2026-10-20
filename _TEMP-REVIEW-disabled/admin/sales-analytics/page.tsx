"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    products: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  function loadAnalytics() {
    try {
      const orders = JSON.parse(localStorage.getItem("freshcut-orders") || "[]");
      const products = JSON.parse(localStorage.getItem("freshcut-products") || "[]");

      const revenue = orders.reduce(
        (sum: number, order: any) =>
          sum + Number(order.total || order.amount || 0),
        0
      );

      const customers = new Set(
        orders.map((o: any) => o.phone).filter(Boolean)
      ).size;

      setStats({
        orders: orders.length,
        revenue,
        customers,
        products: products.length,
      });
    } catch {
      setStats({ orders: 0, revenue: 0, customers: 0, products: 0 });
    }
  }

  const averageOrder =
    stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0;

  const conversion =
    stats.customers > 0
      ? Math.round((stats.orders / stats.customers) * 10) / 10
      : 0;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Fresh2Cook Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
              Sales Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Key performance indicators from current business records.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            className="w-fit rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            â†» Refresh
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Orders", stats.orders, "text-[#123b38]", "bg-slate-50"],
            ["Revenue", `â‚¹${stats.revenue.toLocaleString("en-IN")}`, "text-emerald-700", "bg-emerald-50"],
            ["Customers", stats.customers, "text-blue-700", "bg-blue-50"],
            ["Products", stats.products, "text-violet-700", "bg-violet-50"],
          ].map(([title, value, color, bg]) => (
            <div key={String(title)} className={`rounded-2xl border border-slate-200 ${bg} p-5 shadow-sm`}>
              <p className="text-sm font-semibold text-slate-500">{title}</p>
              <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Average Order Value</p>
            <p className="mt-3 text-5xl font-extrabold text-emerald-700">
              â‚¹{averageOrder.toLocaleString("en-IN")}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Calculated from total revenue and recorded orders.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Orders / Customer</p>
            <p className="mt-3 text-5xl font-extrabold text-blue-700">
              {conversion}x
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Based on current order and customer records.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#063f3d] p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
            Analytics Center
          </p>
          <h2 className="mt-1 text-xl font-extrabold">
            Fresh2Cook business performance at a glance.
          </h2>
        </div>
      </div>
    </div>
  );
}






