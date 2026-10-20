"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function SubscriptionBoxesPage() {
  const [plans, setPlans] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [items, setItems] =
    useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  function loadPlans() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-subscription-boxes"
      ) || "[]"
    );

    setPlans(data);
  }

  function addPlan() {
    if (
      !name ||
      !price ||
      !items
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const updated = [
      {
        id: Date.now(),
        name,
        price:
          Number(price),
        items,
        subscribers: 0,
        status: "Active",
      },
      ...plans,
    ];

    localStorage.setItem(
      "freshcut-subscription-boxes",
      JSON.stringify(updated)
    );

    setName("");
    setPrice("");
    setItems("");

    loadPlans();
  }

  function deletePlan(
    id: number
  ) {
    const updated =
      plans.filter(
        (plan: any) =>
          plan.id !== id
      );

    localStorage.setItem(
      "freshcut-subscription-boxes",
      JSON.stringify(updated)
    );

    loadPlans();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Subscription Boxes
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Create Subscription Box
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Plan Name"
              className="border p-3 rounded-2xl"
            />

            <input
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              placeholder="Monthly Price"
              className="border p-3 rounded-2xl"
            />

            <input
              value={items}
              onChange={(e) =>
                setItems(
                  e.target.value
                )
              }
              placeholder="Included Items"
              className="border p-3 rounded-2xl"
            />

          </div>

          <button
            onClick={addPlan}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Create Plan
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {plans.map(
            (plan: any) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {plan.name}
                </h2>

                <p className="mt-2">
                  ₹{plan.price}/Month
                </p>

                <p className="mt-2 text-gray-600">
                  {plan.items}
                </p>

                <p className="mt-3 font-bold text-green-600">
                  {plan.status}
                </p>

                <p className="mt-2">
                  Subscribers:
                  {" "}
                  {plan.subscribers}
                </p>

                <button
                  onClick={() =>
                    deletePlan(
                      plan.id
                    )
                  }
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-2xl"
                >
                  Delete
                </button>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}











