"use client";

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
        Array.isArray(ordersData) ? ordersData : []
      );

      setFeedback(
        Array.isArray(feedbackData) ? feedbackData : []
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
        existing.totalSpend += Number(order.amount || 0);

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
      (a, b) =>
        b.totalSpend - a.totalSpend
    );
  }, [orders, feedback]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.address.toLowerCase().includes(query)
    );
  }, [customers, search]);

  const totalCustomers = customers.length;

  const repeatCustomers = customers.filter(
    (customer) => customer.orders > 1
  ).length;

  const totalCustomerValue = customers.reduce(
    (sum, customer) => sum + customer.totalSpend,
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
      "Thank you for being a Fresh2Cook customer! ðŸ¥¬â¤ï¸",
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-extrabold">
              Customer Management
            </h1>

            <p className="text-gray-500 mt-1">
              View customers, orders, spending and activity.
            </p>
          </div>

          <button
            onClick={loadData}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            Refresh Customers
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-gray-500">
              Total Customers
            </div>

            <div className="text-3xl font-extrabold mt-1">
              {totalCustomers}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-gray-500">
              Repeat Customers
            </div>

            <div className="text-3xl font-extrabold text-green-600 mt-1">
              {repeatCustomers}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-gray-500">
              Customer Value
            </div>

            <div className="text-2xl font-extrabold text-blue-700 mt-1">
              ₹{totalCustomerValue}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-gray-500">
              Avg Order Value
            </div>

            <div className="text-2xl font-extrabold text-purple-700 mt-1">
              ₹{averageOrderValue}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-5 mb-6">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, mobile or address..."
            className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-green-500"
          />

        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow p-10 text-center">
            Loading Customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-12 text-center">

            <div className="text-6xl mb-4">
              ðŸ‘¥
            </div>

            <h2 className="text-2xl font-bold">
              No Customers Found
            </h2>

            <p className="text-gray-500 mt-2">
              Customers will appear here after orders are created.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredCustomers.map(
              (customer) => (
                <div
                  key={
                    customer.phone ||
                    customer.name
                  }
                  className="bg-white rounded-3xl shadow p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold">
                        {customer.name}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        ðŸ“± {customer.phone || "-"}
                      </p>

                    </div>

                    <div className="text-right">

                      <div className="text-green-700 font-extrabold">
                        ₹{customer.totalSpend}
                      </div>

                      <div className="text-xs text-gray-500">
                        Lifetime Spend
                      </div>

                    </div>
                  </div>

                  <div className="mt-5 space-y-3">

                    <div className="bg-gray-50 rounded-xl p-3">

                      <div className="text-xs text-gray-500">
                        Delivery Address
                      </div>

                      <div className="font-semibold mt-1">
                        {customer.address || "-"}
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <div className="bg-green-50 rounded-xl p-3">

                        <div className="text-xs text-gray-500">
                          Orders
                        </div>

                        <div className="text-xl font-bold text-green-700">
                          {customer.orders}
                        </div>

                      </div>

                      <div className="bg-yellow-50 rounded-xl p-3">

                        <div className="text-xs text-gray-500">
                          Rating
                        </div>

                        <div className="text-xl font-bold text-yellow-600">
                          {customer.rating
                            ? `${customer.rating.toFixed(1)} â­`
                            : "â€”"}
                        </div>

                      </div>

                    </div>

                    <div className="flex items-center justify-between">

                      <div>

                        <div className="text-xs text-gray-500">
                          Last Order
                        </div>

                        <div className="font-semibold text-sm mt-1">
                          {new Date(
                            customer.lastOrder
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>

                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {customer.status}
                      </span>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <a
                      href={`/admin/customers/${encodeURIComponent(
                        customer.phone
                      )}`}
                      className="text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                    >
                      View Details
                    </a>

                    <button
                      onClick={() =>
                        openWhatsApp(
                          customer
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                    >
                      WhatsApp
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}
      </div>
    </div>
  );
}
