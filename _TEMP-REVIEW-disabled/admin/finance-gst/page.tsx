"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function FinanceGSTPage() {
  const [stats, setStats] =
    useState({
      revenue: 0,
      expenses: 0,
      profit: 0,
      gst: 0,
      orders: 0,
    });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const orders = JSON.parse(
      localStorage.getItem(
        "freshcut-orders"
      ) || "[]"
    );

    const expenses = JSON.parse(
      localStorage.getItem(
        "freshcut-expenses"
      ) || "[]"
    );

    const revenue =
      orders.reduce(
        (
          sum: number,
          item: any
        ) =>
          sum +
          Number(
            item.total || 0
          ),
        0
      );

    const totalExpense =
      expenses.reduce(
        (
          sum: number,
          item: any
        ) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    const gst =
      revenue * 0.05;

    const profit =
      revenue -
      totalExpense -
      gst;

    setStats({
      revenue,
      expenses:
        totalExpense,
      profit,
      gst,
      orders:
        orders.length,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Finance & GST Dashboard
        </h1>

        <div className="grid md:grid-cols-5 gap-4 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Revenue</p>
            <h2 className="text-3xl font-bold text-green-600">
              Ã¢â€šÂ¹{stats.revenue}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Expenses</p>
            <h2 className="text-3xl font-bold text-red-600">
              Ã¢â€šÂ¹{stats.expenses}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>GST</p>
            <h2 className="text-3xl font-bold text-orange-600">
              Ã¢â€šÂ¹{stats.gst}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Profit</p>
            <h2 className="text-3xl font-bold text-blue-600">
              Ã¢â€šÂ¹{stats.profit}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Orders</p>
            <h2 className="text-3xl font-bold">
              {stats.orders}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            GST Summary
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between border-b pb-3">
              <span>
                Taxable Revenue
              </span>
              <span>
                Ã¢â€šÂ¹{stats.revenue}
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>
                GST @ 5%
              </span>
              <span>
                Ã¢â€šÂ¹{stats.gst}
              </span>
            </div>

            <div className="flex justify-between font-bold text-xl">
              <span>
                Net Profit
              </span>
              <span>
                Ã¢â€šÂ¹{stats.profit}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}








