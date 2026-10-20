"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem("freshcut-orders") || "[]"));
    } catch {
      setOrders([]);
    }
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || order.amount || 0),
    0
  );
  const averageOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const customers = new Set(orders.map((o) => o.phone).filter(Boolean)).size;

  const cards = [
    ["Total Orders", totalOrders, "text-[#123b38]", "bg-slate-50"],
    ["Revenue", `â‚¹${totalRevenue.toLocaleString("en-IN")}`, "text-emerald-700", "bg-emerald-50"],
    ["Avg Order", `â‚¹${averageOrder.toLocaleString("en-IN")}`, "text-blue-700", "bg-blue-50"],
    ["Customers", customers, "text-violet-700", "bg-violet-50"],
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Sales Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revenue, orders and customer sales overview.
          </p>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([title, value, color, bg]) => (
            <div key={String(title)} className={`rounded-2xl border border-slate-200 ${bg} p-5 shadow-sm`}>
              <p className="text-sm font-semibold text-slate-500">{title}</p>
              <h2 className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</h2>
            </div>
          ))}
        </div>

        <div className="mb-7 grid gap-5 md:grid-cols-3">
          {[
            ["Daily Sales", totalRevenue, "emerald"],
            ["Weekly Sales", totalRevenue, "blue"],
            ["Monthly Sales", totalRevenue, "violet"],
          ].map(([title, value, tone]) => (
            <div key={String(title)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{title}</p>
              <p className={`mt-3 text-3xl font-extrabold ${
                tone === "emerald" ? "text-emerald-700" :
                tone === "blue" ? "text-blue-700" : "text-violet-700"
              }`}>
                â‚¹{Number(value).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#123b38]">Recent Orders</h2>
            <p className="text-sm text-slate-500">Latest sales records</p>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 20).map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-[#123b38]">{order.customer || "Customer"}</p>
                  <p className="text-sm text-slate-500">{order.phone || "â€”"}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-extrabold text-emerald-700">
                    â‚¹{Number(order.total || order.amount || 0).toLocaleString("en-IN")}
                  </p>
                  <span className="text-xs font-semibold text-slate-500">
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}

            {!orders.length && (
              <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                No sales records available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






