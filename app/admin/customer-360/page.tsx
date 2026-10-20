"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Customer360Page() {
  const [customers, setCustomers] =
    useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-customers"
      ) || "[]"
    );

    setCustomers(data);
  }

  function openCustomer(
    customer: any
  ) {
    setSelected({
      ...customer,
      wallet:
        Math.floor(
          Math.random() * 500
        ) + 50,
      loyalty:
        Math.floor(
          Math.random() * 1000
        ) + 100,
      totalOrders:
        Math.floor(
          Math.random() * 50
        ) + 1,
      totalSpent:
        Math.floor(
          Math.random() * 50000
        ) + 1000,
      aiScore:
        Math.floor(
          Math.random() * 100
        ) + 1,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Customer 360° CRM
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              Customers
            </h2>

            <div className="space-y-3">

              {customers.map(
                (customer: any) => (
                  <button
                    key={customer.id}
                    onClick={() =>
                      openCustomer(
                        customer
                      )
                    }
                    className="w-full text-left border rounded-2xl p-4 hover:bg-gray-50"
                  >

                    <p className="font-bold">
                      {customer.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {customer.phone}
                    </p>

                  </button>
                )
              )}

            </div>

          </div>

          <div className="lg:col-span-2">

            {!selected && (
              <div className="bg-white rounded-xl shadow p-10 text-center">

                <h2 className="text-2xl font-bold">
                  Select Customer
                </h2>

              </div>
            )}

            {selected && (
              <div className="space-y-6">

                <div className="bg-white rounded-xl shadow p-6">

                  <h2 className="text-3xl font-bold">
                    {selected.name}
                  </h2>

                  <p>
                    📞 {selected.phone}
                  </p>

                  <p>
                    📧 {selected.email}
                  </p>

                </div>

                <div className="grid md:grid-cols-4 gap-5">

                  <div className="bg-white rounded-2xl shadow p-5">
                    <p>Wallet</p>
                    <h3 className="text-2xl font-bold text-green-600">
                      ₹{selected.wallet}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-5">
                    <p>Loyalty</p>
                    <h3 className="text-2xl font-bold text-blue-600">
                      {selected.loyalty}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-5">
                    <p>Orders</p>
                    <h3 className="text-2xl font-bold text-purple-600">
                      {selected.totalOrders}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-5">
                    <p>Spent</p>
                    <h3 className="text-2xl font-bold text-orange-600">
                      ₹{selected.totalSpent}
                    </h3>
                  </div>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                  <h2 className="text-2xl font-bold mb-4">
                    AI Insights
                  </h2>

                  <div className="space-y-3">

                    <div className="bg-green-50 p-4 rounded-2xl">
                      Customer Score:
                      {" "}
                      <strong>
                        {selected.aiScore}/100
                      </strong>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl">
                      Recommended:
                      Weekly Veg Subscription
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-2xl">
                      Reorder Probability:
                      High
                    </div>

                    <div className="bg-purple-50 p-4 rounded-2xl">
                      VIP Status:
                      {selected.totalSpent >
                      10000
                        ? " VIP"
                        : " Regular"}
                    </div>

                  </div>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                  <h2 className="text-2xl font-bold mb-4">
                    Quick Actions
                  </h2>

                  <div className="flex flex-wrap gap-5">

                    <button className="bg-green-600 text-white px-4 py-2 rounded-2xl">
                      WhatsApp
                    </button>

                    <button className="bg-blue-600 text-white px-4 py-2 rounded-2xl">
                      Add Wallet
                    </button>

                    <button className="bg-purple-600 text-white px-4 py-2 rounded-2xl">
                      Give Coupon
                    </button>

                    <button className="bg-orange-600 text-white px-4 py-2 rounded-2xl">
                      Create Order
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}












