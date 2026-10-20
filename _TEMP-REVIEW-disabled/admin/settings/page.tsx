"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Settings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  deliveryCharge: string;
  minOrder: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    businessName: "Fresh2Cook",
    phone: "9811001901",
    email: "info@freshcut.com",
    address: "New Delhi",
    deliveryCharge: "40",
    minOrder: "199",
  });

  useEffect(() => {
    try {
      const data = localStorage.getItem("freshcut-settings");
      if (data) setSettings(JSON.parse(data));
    } catch {
      // keep defaults
    }
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function saveSettings() {
    localStorage.setItem("freshcut-settings", JSON.stringify(settings));
    alert("Settings Saved Successfully");
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage core business and delivery configuration.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-[#123b38]">
              Business Configuration
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the information used across the system.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Business Name"
              value={settings.businessName}
              onChange={(value) => update("businessName", value)}
            />

            <Field
              label="Mobile Number"
              value={settings.phone}
              onChange={(value) => update("phone", value)}
            />

            <Field
              label="Email Address"
              value={settings.email}
              onChange={(value) => update("email", value)}
            />

            <Field
              label="Delivery Charge"
              value={settings.deliveryCharge}
              onChange={(value) => update("deliveryCharge", value)}
            />

            <Field
              label="Minimum Order Value"
              value={settings.minOrder}
              onChange={(value) => update("minOrder", value)}
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-600">
                Business Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="mt-7 rounded-xl bg-[#063f3d] px-10 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-600">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
      />
    </div>
  );
}






