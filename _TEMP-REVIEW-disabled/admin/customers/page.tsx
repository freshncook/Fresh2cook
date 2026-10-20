"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: number;
  customer: string;
  phone?: string | null;
  address?: string | null;
  amount: number;
  status: string;
  createdAt: string;
};

type Feedback = {
  id: number;
  customer: string;
  phone: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Customer = {
  name: string;
  phone: string;
  address: string;
  orders: number;
  totalSpend: number;
  lastOrder: string;
  status: string;
  rating: number | null;
};

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, feedbackRes] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/feedback", { cache: "no-store" }),
      ]);

      const ordersData = await ordersRes.json();
      const feedbackData = await feedbackRes.json();

      if (!ordersRes.ok) {
        throw new Error(
          ordersData?.error || "Failed to load orders"
        );
      }

      if (!feedbackRes.ok) {
        throw new Error(
          feedbackData?.error || "Failed to load feedback"
        );
      }

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : ordersData?.orders || []
      );

      setFeedback(
        Array.isArray(feedbackData)
          ? feedbackData
          : feedbackData?.feedback || []
      );
    } catch (error) {
      console.error("CUSTOMERS LOAD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  }

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();

    for (const order of orders) {
      const phone = String(order.phone || "").trim();

      const key =
        phone ||
        order.customer.trim().toLowerCase();

      const existing = map.get(key);

      if (existing) {
        existing.orders += 1;
        existing.totalSpend += Number(
          order.amount || 0
        );

        if (
          new Date(order.createdAt).getTime() >
          new Date(existing.lastOrder).getTime()
        ) {
          existing.lastOrder = order.createdAt;
          existing.address =
            order.address || existing.address;
          existing.status = order.status;
        }

        continue;
      }

      const customerReviews = feedback.filter(
        (item) =>
          item.phone === phone ||
          item.customer.trim().toLowerCase() ===
            order.customer.trim().toLowerCase()
      );

      const rating =
        customerReviews.length > 0
          ? customerReviews.reduce(
              (sum, item) =>
                sum + Number(item.rating || 0),
              0
            ) / customerReviews.length
          : null;

      map.set(key, {
        name: order.customer,
        phone,
        address: order.address || "",
        orders: 1,
        totalSpend: Number(order.amount || 0),
        lastOrder: order.createdAt,
        status: order.status,
        rating,
      });
    }

    return Array.from(map.values()).sort(
      (a, b) => b.totalSpend - a.totalSpend
    );
  }, [orders, feedback]);

  const statuses = useMemo(() => {
    const values = customers
      .map((customer) => customer.status)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.phone
          .toLowerCase()
          .includes(query) ||
        customer.address
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const repeatCustomers = customers.filter(
    (customer) => customer.orders > 1
  ).length;

  const totalCustomerValue = customers.reduce(
    (sum, customer) =>
      sum + customer.totalSpend,
    0
  );

  const averageOrderValue =
    orders.length > 0
      ? Math.round(
          orders.reduce(
            (sum, order) =>
              sum + Number(order.amount || 0),
            0
          ) / orders.length
        )
      : 0;

  const activeCustomers = customers.filter(
    (customer) =>
      !["Delivered", "Cancelled"].includes(
        customer.status
      )
  ).length;

  function openWhatsApp(customer: Customer) {
    const cleanedPhone =
      customer.phone.replace(/\D/g, "");

    if (!cleanedPhone) {
      alert(
        "Customer mobile number is not available."
      );
      return;
    }

    const number =
      cleanedPhone.length === 10
        ? `91${cleanedPhone}`
        : cleanedPhone;

    const message = [
      `Hello ${customer.name},`,
      "",
      "Thank you for being a Fresh2Cook customer! ??",
      "",
      "How can we help you today?",
    ].join("\n");

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function formatDate(date: string) {
    if (!date) return "ï¿½";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "ï¿½";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getStatusClass(status: string) {
    const value = status.toLowerCase();

    if (value.includes("deliver")) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (value.includes("cancel")) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value.includes("assign")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (value.includes("process")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return (
    <div className="min-h-screen bg-[#f4f7f7] p-4 md:p-6">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-[#063f3d] to-[#0b625c] px-6 py-7 text-white">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                  ??
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Customer Management
                  </h1>

                  <p className="text-sm text-white/70 mt-1">
                    Customers, orders, spending and activity
                  </p>
                </div>
              </div>

              <button
                onClick={loadData}
                className="bg-white text-[#063f3d] px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
              >
                ? Refresh Customers
              </button>

            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-gray-100">

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-[#063f3d] mt-1">
                {totalCustomers}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Repeat Customers
              </p>
              <p className="text-2xl font-bold text-[#159447] mt-1">
                {repeatCustomers}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Customer Value
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                ?{totalCustomerValue.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Avg Order Value
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                ?{averageOrderValue.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Active Customers
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {activeCustomers}
              </p>
            </div>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        {/* FILTER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ??
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search customer, mobile or address..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="md:w-56 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#159447]"
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "All"
                    ? "All Statuses"
                    : status}
                </option>
              ))}
            </select>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Showing {filteredCustomers.length} of{" "}
            {customers.length} customers
          </p>
        </div>

        {/* CUSTOMER LIST */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-semibold text-gray-500">
              Loading Customers...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-14 text-center">

            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mx-auto">
              ??
            </div>

            <h2 className="text-xl font-bold text-[#063f3d] mt-5">
              No Customers Found
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Customers will appear here after orders are created.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredCustomers.map((customer) => (

              <div
                key={
                  customer.phone ||
                  customer.name
                }
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
              >

                {/* CARD HEADER */}
                <div className="bg-gradient-to-r from-[#063f3d] to-[#0b625c] p-5 text-white">

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-11 h-11 shrink-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">
                        {customer.name
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-bold text-lg truncate">
                          {customer.name}
                        </h2>

                        <p className="text-white/70 text-xs mt-1">
                          {customer.phone || "Mobile unavailable"}
                        </p>
                      </div>

                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-green-300">
                        ?{customer.totalSpend.toLocaleString("en-IN")}
                      </div>

                      <div className="text-[10px] text-white/60">
                        Lifetime Spend
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-5">

                  {/* STATUS */}
                  <div className="flex items-center justify-between gap-3">

                    <span
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${getStatusClass(
                        customer.status
                      )}`}
                    >
                      {customer.status || "Unknown"}
                    </span>

                    <span className="text-xs text-gray-500">
                      Last order:{" "}
                      {formatDate(
                        customer.lastOrder
                      )}
                    </span>

                  </div>

                  {/* ADDRESS */}
                  <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">

                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                      Delivery Address
                    </p>

                    <p className="text-sm text-gray-700 font-medium mt-1 leading-relaxed">
                      {customer.address || "Address not available"}
                    </p>

                  </div>

                  {/* METRICS */}
                  <div className="grid grid-cols-3 gap-2 mt-4">

                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500">
                        Orders
                      </p>
                      <p className="text-xl font-bold text-[#159447]">
                        {customer.orders}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500">
                        Rating
                      </p>
                      <p className="text-xl font-bold text-yellow-600">
                        {customer.rating !== null
                          ? `${customer.rating.toFixed(1)} ?`
                          : "ï¿½"}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500">
                        Avg Order
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        ?
                        {customer.orders > 0
                          ? Math.round(
                              customer.totalSpend /
                                customer.orders
                            ).toLocaleString("en-IN")
                          : "0"}
                      </p>
                    </div>

                  </div>

                  {/* ACTION */}
                  <button
                    onClick={() =>
                      openWhatsApp(customer)
                    }
                    className="w-full mt-4 bg-[#159447] hover:bg-[#117b3b] text-white py-3 rounded-xl font-bold text-sm transition"
                  >
                    WhatsApp Customer
                  </button>

                </div>
              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  );
}






