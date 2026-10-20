"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function WhatsAppAutomationPage() {
  const [rules, setRules] =
    useState<any[]>([]);

  useEffect(() => {
    loadRules();
  }, []);

  function loadRules() {
    const saved =
      JSON.parse(
        localStorage.getItem(
          "freshcut-whatsapp-rules"
        ) || "[]"
      );

    if (saved.length > 0) {
      setRules(saved);
      return;
    }

    const defaultRules = [
      {
        id: 1,
        name:
          "Birthday Wishes",
        enabled: true,
        template:
          "🎉 Happy Birthday! Fresh2Cook ki taraf se aapko dher sari shubhkamnaye.",
      },
      {
        id: 2,
        name:
          "Reorder Reminder",
        enabled: true,
        template:
          "🥬 Aapka regular order due hai. Fresh vegetables order karein.",
      },
      {
        id: 3,
        name:
          "Cart Abandonment",
        enabled: true,
        template:
          "🛒 Aapke cart me items pending hain. Order complete karein.",
      },
      {
        id: 4,
        name:
          "Subscription Renewal",
        enabled: true,
        template:
          "📦 Aapki subscription renew hone wali hai.",
      },
    ];

    setRules(
      defaultRules
    );

    localStorage.setItem(
      "freshcut-whatsapp-rules",
      JSON.stringify(
        defaultRules
      )
    );
  }

  function toggleRule(
    id: number
  ) {
    const updated =
      rules.map(
        (rule: any) =>
          rule.id === id
            ? {
                ...rule,
                enabled:
                  !rule.enabled,
              }
            : rule
      );

    setRules(updated);

    localStorage.setItem(
      "freshcut-whatsapp-rules",
      JSON.stringify(
        updated
      )
    );
  }

  function runNow(
    name: string
  ) {
    alert(
      `${name} Campaign Triggered`
    );
  }

  const activeRules =
    rules.filter(
      (r: any) =>
        r.enabled
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          WhatsApp Automation Engine
        </h1>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">

            <p>
              Total Rules
            </p>

            <h2 className="text-3xl font-bold">
              {rules.length}
            </h2>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <p>
              Active Rules
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              {activeRules}
            </h2>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <p>
              Today's Triggers
            </p>

            <h2 className="text-3xl font-bold text-blue-600">
              47
            </h2>

          </div>

        </div>

        <div className="space-y-6">

          {rules.map(
            (rule: any) => (
              <div
                key={rule.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex flex-col md:flex-row md:justify-between gap-5">

                  <div>

                    <h2 className="text-xl font-bold">
                      {rule.name}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {rule.template}
                    </p>

                    <p className="mt-3">

                      Status:

                      <span
                        className={`ml-2 font-bold ${
                          rule.enabled
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {rule.enabled
                          ? "Active"
                          : "Disabled"}
                      </span>

                    </p>

                  </div>

                  <div className="flex gap-5">

                    <button
                      onClick={() =>
                        toggleRule(
                          rule.id
                        )
                      }
                      className="bg-yellow-500 text-white px-4 py-2 rounded-2xl"
                    >
                      {rule.enabled
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      onClick={() =>
                        runNow(
                          rule.name
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-2xl"
                    >
                      Run Now
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}











