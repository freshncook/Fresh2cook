"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [boys, setBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, boysRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/delivery-boys"),
      ]);

      const ordersData = await ordersRes.json();
      const boysData = await boysRes.json();

      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.orders || []);
      setBoys(
        Array.isArray(boysData)
          ? boysData
          : boysData?.riders || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function assignOrder(orderId: number, riderId: number) {
    if (!riderId) return;

    try {
      const res = await fetch("/api/delivery-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          riderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Assignment Failed");
        return;
      }

      alert("Order Assigned Successfully");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Something Went Wrong");
    }
  }

  const statuses = useMemo(() => {
    const values = orders
      .map((order) => order.status)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.id || "").toLowerCase().includes(keyword) ||
        String(order.customer || "").toLowerCase().includes(keyword) ||
        String(order.phone || "").toLowerCase().includes(keyword) ||
        String(order.address || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0
  );

  const pendingCount = orders.filter(
    (order) =>
      !["Delivered", "Cancelled"].includes(order.status)
  ).length;

  const assignedCount = orders.filter((order) =>
    String(order.status || "")
      .toLowerCase()
      .includes("assigned")
  ).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f7f7]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-6 text-center">
          <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-semibold text-gray-600">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f7] p-4 md:p-6">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#063f3d] to-[#0b625c] px-6 py-7 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                    Ã°Å¸â€œÂ¦
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Orders Management
                    </h1>

                    <p className="text-sm text-white/70 mt-1">
                      Manage orders and assign delivery riders
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={loadData}
                className="bg-white text-[#063f3d] px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
              >
                Ã¢â€ Â» Refresh Orders
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-[#063f3d] mt-1">
                {orders.length}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Orders
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {pendingCount}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Assigned
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {assignedCount}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order Value
              </p>
              <p className="text-2xl font-bold text-[#159447] mt-1">
                Ã¢â€šÂ¹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                Ã°Å¸â€Â
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, customer, mobile or address..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#159447]/20 focus:border-[#159447]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="md:w-56 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#159447]/20 focus:border-[#159447]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ORDERS */}
        <div className="space-y-4">

          {filteredOrders.map((order: any) => {
            const status = String(order.status || "Unknown");

            const statusLower = status.toLowerCase();

            const statusClass =
              statusLower.includes("deliver")
                ? "bg-green-50 text-green-700 border-green-200"
                : statusLower.includes("cancel")
                ? "bg-red-50 text-red-700 border-red-200"
                : statusLower.includes("assign")
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : statusLower.includes("process")
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-orange-50 text-orange-700 border-orange-200";

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-5 md:p-6">

                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                    {/* ORDER INFO */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="bg-[#063f3d] text-white px-4 py-2 rounded-xl font-bold">
                          #{order.id}
                        </div>

                        <span
                          className={`px-4 py-2 rounded-full border text-xs font-bold ${statusClass}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                            Customer
                          </p>
                          <p className="font-bold text-gray-800 mt-1">
                            {order.customer || "Ã¢â‚¬â€"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                            Mobile
                          </p>
                          <p className="font-bold text-gray-800 mt-1">
                            {order.phone || "Ã¢â‚¬â€"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                            Order Value
                          </p>
                          <p className="font-bold text-[#159447] mt-1">
                            Ã¢â€šÂ¹{Number(order.amount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                            Delivery
                          </p>
                          <p className="font-bold text-gray-800 mt-1">
                            {statusLower.includes("deliver")
                              ? "Completed"
                              : statusLower.includes("assign")
                              ? "Rider Assigned"
                              : "Awaiting Assignment"}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 bg-[#f8faf9] border border-gray-100 rounded-xl p-4">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                          Delivery Address
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {order.address || "Address not available"}
                        </p>
                      </div>
                    </div>

                    {/* ASSIGN RIDER */}
                    <div className="xl:w-80 bg-[#f8faf9] border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-[#063f3d] text-white flex items-center justify-center">
                          Ã°Å¸Å¡Å¡
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">
                            Delivery Rider
                          </p>
                          <p className="text-xs text-gray-500">
                            Assign this order
                          </p>
                        </div>
                      </div>

                      <select
                        className="w-full border border-gray-200 bg-white p-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#159447]/20 focus:border-[#159447]"
                        onChange={(e) =>
                          assignOrder(
                            order.id,
                            Number(e.target.value)
                          )
                        }
                        defaultValue=""
                      >
                        <option value="">
                          Select Rider
                        </option>

                        {(boys || []).map((boy: any) => (
                          <option
                            key={boy.id}
                            value={boy.id}
                          >
                            {boy.name} - {boy.mobile}
                          </option>
                        ))}
                      </select>

                      {boys.length === 0 && (
                        <p className="text-xs text-red-600 mt-3">
                          No delivery riders available.
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mx-auto">
                Ã°Å¸â€œÂ¦
              </div>

              <h2 className="text-xl font-bold text-[#063f3d] mt-5">
                No Orders Found
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Try changing your search or status filter.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}







