"use client";

import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] =
    useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-subscription"
      ) || "null"
    );

    setSubscription(data);
  }, []);

  function createSubscription(
    plan: string
  ) {
    const sub = {
      id: Date.now(),
      plan,
      status: "Active",
      startDate:
        new Date().toLocaleDateString(),
    };

    localStorage.setItem(
      "freshcut-subscription",
      JSON.stringify(sub)
    );

    setSubscription(sub);

    alert(
      plan +
        " Subscription Activated"
    );
  }

  function pauseSubscription() {
    const updated = {
      ...subscription,
      status: "Paused",
    };

    localStorage.setItem(
      "freshcut-subscription",
      JSON.stringify(updated)
    );

    setSubscription(updated);
  }

  function resumeSubscription() {
    const updated = {
      ...subscription,
      status: "Active",
    };

    localStorage.setItem(
      "freshcut-subscription",
      JSON.stringify(updated)
    );

    setSubscription(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Fresh2Cook Subscription
        </h1>

        {!subscription && (

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-2xl font-bold">
                Daily Plan
              </h2>

              <p className="mt-3">
                Fresh delivery every day
              </p>

              <button
                onClick={() =>
                  createSubscription(
                    "Daily"
                  )
                }
                className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                Subscribe
              </button>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-2xl font-bold">
                Weekly Plan
              </h2>

              <p className="mt-3">
                Delivery every week
              </p>

              <button
                onClick={() =>
                  createSubscription(
                    "Weekly"
                  )
                }
                className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                Subscribe
              </button>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-2xl font-bold">
                Monthly Plan
              </h2>

              <p className="mt-3">
                Delivery every month
              </p>

              <button
                onClick={() =>
                  createSubscription(
                    "Monthly"
                  )
                }
                className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                Subscribe
              </button>

            </div>

          </div>

        )}

        {subscription && (

          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-3xl font-bold mb-6">
              Subscription Details
            </h2>

            <p>
              Plan:
              {" "}
              <strong>
                {
                  subscription.plan
                }
              </strong>
            </p>

            <p>
              Status:
              {" "}
              <strong>
                {
                  subscription.status
                }
              </strong>
            </p>

            <p>
              Started:
              {" "}
              {
                subscription.startDate
              }
            </p>

            <div className="flex gap-4 mt-8">

              <button
                onClick={
                  pauseSubscription
                }
                className="bg-yellow-500 text-white px-6 py-3 rounded-xl"
              >
                Pause
              </button>

              <button
                onClick={
                  resumeSubscription
                }
                className="bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                Resume
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}






