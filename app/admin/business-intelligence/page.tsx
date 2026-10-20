"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Stats = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
};

export default function BusinessIntelligencePage() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const orders = JSON.parse(
        localStorage.getItem("freshcut-orders") || "[]"
      );

      const customers = JSON.parse(
        localStorage.getItem("freshcut-customers") || "[]"
      );

      const products = JSON.parse(
        localStorage.getItem("freshcut-products") || "[]"
      );

      const revenue = orders.reduce(
        (sum: number, item: any) =>
          sum + Number(item.total || item.amount || 0),
        0
      );

      setStats({
        revenue,
        orders: orders.length,
        customers: customers.length,
        products: products.length,
      });
    } catch (error) {
      console.error("Business Intelligence load error:", error);
    }
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      subtitle: "Overall business revenue",
      icon: "₹",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-700",
    },
    {
      title: "Total Orders",
      value: stats.orders.toLocaleString("en-IN"),
      subtitle: "Orders recorded",
      icon: "↗",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconText: "text-blue-700",
    },
    {
      title: "Customers",
      value: stats.customers.toLocaleString("en-IN"),
      subtitle: "Customer records",
      icon: "◉",
      bg: "bg-violet-50",
      iconBg: "bg-violet-100",
      iconText: "text-violet-700",
    },
    {
      title: "Products",
      value: stats.products.toLocaleString("en-IN"),
      subtitle: "Products in catalogue",
      icon: "▦",
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconText: "text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <div className="mx-auto max-w-[1600px] p-5 md:p-7">

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Fresh2Cook Admin
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#123b38] md:text-4xl">
              Business Intelligence
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Business performance, trends and operational insights.
            </p>
          </div>

          <button
            onClick={loadData}
            className="w-fit rounded-2xl bg-[#063f3d] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0a514d]"
          >
            ↻ Refresh Data
          </button>
        </div>

        <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border border-slate-200 ${item.bg} p-5 shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {item.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold text-[#123b38]">
                    {item.value}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconText} text-lg font-extrabold`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#123b38]">
                  Business Overview
                </h2>
                <p className="text-sm text-slate-500">
                  Current business activity snapshot
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                LIVE DATA
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#123b38]">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Orders
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#123b38]">
                  {stats.orders}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Customers
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#123b38]">
                  {stats.customers}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#063f3d] text-xl text-white">
                ↗
              </div>
              <h3 className="font-bold text-[#123b38]">
                Analytics Workspace
              </h3>
              <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                Detailed charts and period-wise analytics can be connected
                here as the business data grows.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <h2 className="text-lg font-extrabold text-[#123b38]">
              Business Insights
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current dashboard indicators
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800">
                  Revenue Overview
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Total recorded revenue is ₹
                  {stats.revenue.toLocaleString("en-IN")}.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="font-bold text-blue-800">
                  Order Activity
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {stats.orders} orders are currently available in the
                  business dataset.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="font-bold text-violet-800">
                  Customer Base
                </p>
                <p className="mt-1 text-xs text-violet-700">
                  {stats.customers} customer records are available.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="font-bold text-orange-800">
                  Product Catalogue
                </p>
                <p className="mt-1 text-xs text-orange-700">
                  {stats.products} products are recorded in the catalogue.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-[#063f3d] p-5 text-white shadow-md">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
                Fresh2Cook Intelligence
              </p>
              <h2 className="mt-1 text-xl font-extrabold">
                One dashboard for your complete business picture.
              </h2>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50">
              Data refreshed from current system records
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}












