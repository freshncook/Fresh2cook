"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  customer: string;
  phone?: string | null;
  address?: string | null;
  amount: number;
  status: string;
  createdAt: string;
};

const steps = [
  "Pending",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

export default function OrderTrackingPage() {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      const orderId = Number(
        localStorage.getItem(
          "freshcut-order-id"
        ) || 0
      );

      if (!orderId) {
        setError(
          "No recent order found."
        );
        return;
      }

      const response =
        await fetch("/api/orders", {
          cache: "no-store",
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load order"
        );
      }

      const found =
        Array.isArray(data)
          ? data.find(
              (item: Order) =>
                item.id === orderId
            )
          : null;

      if (!found) {
        setError(
          "Order not found."
        );
        return;
      }

      setOrder(found);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  }

  function getStepIndex(status: string) {
    if (
      status === "Cancelled"
    ) {
      return -1;
    }

    return steps.indexOf(status);
  }

  function getWhatsAppNumber() {
    const phone = String(
      order?.phone || ""
    ).replace(/\D/g, "");

    if (phone.length === 10) {
      return `91${phone}`;
    }

    return phone;
  }

  function contactWhatsApp() {
    const number =
      getWhatsAppNumber();

    if (!number) {
      alert(
        "Customer mobile number is not available."
      );
      return;
    }

    const message = [
      `Hello ${order?.customer || ""},`,
      "",
      `Your Fresh2Cook order #${order?.id} is currently ${order?.status}.`,
      `Order Amount: ₹${order?.amount || 0}`,
      "",
      "Thank you for choosing Fresh2Cook! 🥬❤️",
    ].join("\n");

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-xl font-bold text-green-700">
            Loading Order...
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md w-full">

          <div className="text-6xl mb-4">
            📦
          </div>

          <h1 className="text-2xl font-bold">
            {error || "Order not found"}
          </h1>

          <a
            href="/products"
            className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Continue Shopping
          </a>

        </div>
      </main>
    );
  }

  const currentStep =
    getStepIndex(order.status);

  const cancelled =
    order.status === "Cancelled";

  return (
    <main className="min-h-screen bg-[#f7f7f3] p-6">

      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Track Your Order
            </h1>

            <p className="text-gray-500 mt-1">
              Order #{order.id}
            </p>
          </div>

          <a
            href="/products"
            className="text-green-700 font-bold"
          >
            Shop More
          </a>

        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="flex flex-col md:flex-row md:justify-between gap-5">

            <div>

              <p className="text-sm text-gray-500">
                Customer
              </p>

              <h2 className="text-xl font-bold mt-1">
                {order.customer}
              </h2>

              <p className="text-gray-600 mt-1">
                📱 {order.phone || "-"}
              </p>

              <p className="text-gray-600 mt-2">
                📍 {order.address || "-"}
              </p>

            </div>

            <div className="md:text-right">

              <p className="text-sm text-gray-500">
                Order Total
              </p>

              <p className="text-3xl font-extrabold text-green-700">
                ₹{order.amount}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {new Date(
                  order.createdAt
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          <div className="border-t mt-6 pt-6">

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-xl font-bold">
                Order Status
              </h3>

              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  cancelled
                    ? "bg-red-100 text-red-700"
                    : order.status ===
                      "Delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {order.status}
              </span>

            </div>

            {cancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 font-semibold text-center">
                This order has been cancelled.
              </div>
            ) : (
              <div className="space-y-6">

                {steps.map(
                  (step, index) => {

                    const completed =
                      index <= currentStep;

                    const current =
                      index === currentStep;

                    return (
                      <div
                        key={step}
                        className="flex items-center gap-4"
                      >

                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${
                            completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          } ${
                            current
                              ? "ring-4 ring-green-100"
                              : ""
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <div>

                          <div
                            className={`font-bold ${
                              completed
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {step}
                          </div>

                          <div className="text-sm text-gray-400">
                            {step === "Pending" &&
                              "Order received"}
                            {step === "Confirmed" &&
                              "Order confirmed by Fresh2Cook"}
                            {step === "Packed" &&
                              "Your fresh products are packed"}
                            {step ===
                              "Out for Delivery" &&
                              "Your order is on the way"}
                            {step ===
                              "Delivered" &&
                              "Order delivered successfully"}
                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-8">

            <button
              onClick={loadOrder}
              className="border-2 border-green-600 text-green-700 py-3 rounded-xl font-bold"
            >
              Refresh Status
            </button>

            <button
              onClick={contactWhatsApp}
              className="bg-green-600 text-white py-3 rounded-xl font-bold"
            >
              WhatsApp Support
            </button>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mt-5 text-center">

          <h2 className="text-xl font-bold">
            Need Help?
          </h2>

          <p className="text-gray-500 mt-2">
            Contact us on WhatsApp for any order-related help.
          </p>

          <a
            href="https://wa.me/919811001901"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Contact Fresh2Cook
          </a>

        </div>

      </div>

    </main>
  );
}





