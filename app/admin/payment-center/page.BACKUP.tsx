"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function PaymentCenterPage() {
  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadPaymentStatus() {
    setLoading(true);

    try {
      const [configResponse, healthResponse] = await Promise.all([
        fetch("/api/payments/config"),
        fetch("/api/payments/health"),
      ]);

      const configData = await configResponse.json();
      const healthData = await healthResponse.json();

      setConfig(configData);
      setHealth(healthData);
    } catch (error) {
      console.error("Payment Center error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPaymentStatus();
  }, []);

  const gatewayStatus = health?.status || "Unknown";

  const items = [
    {
      title: "Razorpay Key",
      status: config?.razorpayConfigured ? "Configured" : "Missing",
      ok: !!config?.razorpayConfigured,
      icon: "KEY",
    },
    {
      title: "Razorpay Secret",
      status: config?.razorpaySecretConfigured ? "Configured" : "Missing",
      ok: !!config?.razorpaySecretConfigured,
      icon: "SEC",
    },
    {
      title: "Gateway Health",
      status: gatewayStatus,
      ok: String(gatewayStatus).toLowerCase() === "ok" ||
          String(gatewayStatus).toLowerCase() === "healthy",
      icon: "API",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Fresh2Cook Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
              Payment Center
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Payment gateway configuration and system health.
            </p>
          </div>

          <button
            onClick={loadPaymentStatus}
            className="w-fit rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            {loading ? "Checking..." : "Ã¢â€ Â» Refresh Status"}
          </button>
        </div>

        <div className="mb-7 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f3f1] text-xs font-extrabold text-[#063f3d]">
                  {item.icon}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.ok
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold text-[#123b38]">
                {item.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Payment system status
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#123b38]">
                Payment Gateway
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current Razorpay integration status.
              </p>
            </div>

            <div
              className={`rounded-xl px-5 py-3 text-sm font-extrabold ${
                items[2].ok
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {gatewayStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







