"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<any[]>([]);

  const [customer, setCustomer] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [plan, setPlan] =
    useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  function loadSubscriptions() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-subscriptions"
      ) || "[]"
    );

    setSubscriptions(data);
  }

  function addSubscription() {
    if (
      !customer ||
      !phone ||
      !plan
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const subscription = {
      id: Date.now(),
      customer,
      phone,
      plan,
      status: "Active",
      startDate:
        new Date().toLocaleDateString(),
    };

    const updated = [
      subscription,
      ...subscriptions,
    ];

    localStorage.setItem(
      "freshcut-subscriptions",
      JSON.stringify(updated)
    );

    setSubscriptions(updated);

    setCustomer("");
    setPhone("");
    setPlan("");

    alert(
      "Subscription Added Successfully"
    );
  }

  function toggleStatus(
    id: number
  ) {
    const updated =
      subscriptions.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                status:
                  item.status ===
                  "Active"
                    ? "Paused"
                    : "Active",
              }
            : item
      );

    localStorage.setItem(
      "freshcut-subscriptions",
      JSON.stringify(updated)
    );

    setSubscriptions(updated);
  }

  function deleteSubscription(
    id: number
  ) {
    if (
      !confirm(
        "Delete Subscription?"
      )
    )
      return;

    const updated =
      subscriptions.filter(
        (item) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-subscriptions",
      JSON.stringify(updated)
    );

    setSubscriptions(updated);
  }

  const activePlans =
    subscriptions.filter(
      (item) =>
        item.status ===
        "Active"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Subscription Management
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Create Subscription
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={customer}
              onChange={(e) =>
                setCustomer(
                  e.target.value
                )
              }
              placeholder="Customer Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Mobile Number"
              className="border p-3 rounded-xl"
            />

            <select
              value={plan}
              onChange={(e) =>
                setPlan(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            >
              <option value="">
                Select Plan
              </option>

              <option>
                Daily Veg Box
              </option>

              <option>
                Weekly Family Box
              </option>

              <option>
                Monthly Healthy Box
              </option>

              <option>
                Premium Fresh2Cook
              </option>

            </select>

          </div>

          <button
            onClick={
              addSubscription
            }
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Add Subscription
          </button>

        </div>

        <div className="bg-green-50 rounded-xl p-6 mb-8">

          <h2 className="text-2xl font-bold">
            Active Plans
          </h2>

          <div className="text-5xl font-bold text-green-600 mt-3">
            {activePlans}
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {subscriptions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {item.customer}
                </h2>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¾ {item.phone}
                </p>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ {item.plan}
                </p>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ {item.startDate}
                </p>

                <div className="mt-4">

                  <span
                    className={`px-4 py-2 rounded-full ${
                      item.status ===
                      "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() =>
                      toggleStatus(
                        item.id
                      )
                    }
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Pause
                  </button>

                  <button
                    onClick={() =>
                      deleteSubscription(
                        item.id
                      )
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}








