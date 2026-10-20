"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function CEOCommandCenter2() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    vendors: 0,
    franchises: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const orders = JSON.parse(
      localStorage.getItem("freshcut-orders") || "[]"
    );

    const customers = JSON.parse(
      localStorage.getItem("freshcut-customers") || "[]"
    );

    const products = JSON.parse(
      localStorage.getItem("freshcut-products") || "[]"
    );

    const vendors = JSON.parse(
      localStorage.getItem("freshcut-vendors") || "[]"
    );

    const franchises = JSON.parse(
      localStorage.getItem("freshcut-franchises") || "[]"
    );

    const revenue = orders.reduce(
      (sum: number, item: any) =>
        sum + Number(item.total || 0),
      0
    );

    setStats({
      revenue,
      orders: orders.length,
      customers: customers.length,
      products: products.length,
      vendors: vendors.length,
      franchises: franchises.length,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          CEO Command Center 2.0
        </h1>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Total Revenue</p>
            <h2 className="text-3xl font-bold text-green-600">
              ₹{stats.revenue}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Total Orders</p>
            <h2 className="text-3xl font-bold">
              {stats.orders}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Total Customers</p>
            <h2 className="text-3xl font-bold">
              {stats.customers}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Total Products</p>
            <h2 className="text-3xl font-bold">
              {stats.products}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Total Vendors</p>
            <h2 className="text-3xl font-bold">
              {stats.vendors}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p>Franchises</p>
            <h2 className="text-3xl font-bold">
              {stats.franchises}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-5 mt-8">

          <h2 className="text-2xl font-bold mb-4">
            CEO Insights
          </h2>

          <div className="space-y-3">

            <div className="p-4 bg-green-50 rounded-2xl">
              📈 Revenue Growth Tracking
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl">
              🛒 Order Performance Monitoring
            </div>

            <div className="p-4 bg-yellow-50 rounded-2xl">
              📦 Inventory Health Status
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl">
              🤖 AI Business Recommendations
            </div>

            <div className="p-4 bg-red-50 rounded-2xl">
              ⚠ Critical Alerts & Risks
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}












