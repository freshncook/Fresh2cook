"use client";

import Link from "next/link";

const stats = [
  { label: "Riders", value: "0" },
  { label: "Assigned", value: "0" },
  { label: "Delivered", value: "0" },
  { label: "Pending", value: "0" },
];

const actions = [
  ["Dispatch Board","??","/delivery/dispatch-board"],
  ["Assign Orders","??","/delivery/assignments"],
  ["Live Tracking","??","/delivery/live-tracking"],
  ["Rider Manager","???","/delivery/riders"],
  ["Fleet Dashboard","??","/delivery/fleet-dashboard"],
  ["Route Optimizer","???","/delivery/route-optimizer"],
  ["Reports","??","/delivery/reports"],
  ["Settings","??","/delivery/settings"],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100">

      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">
              Delivery Control Center
            </h1>
            <p className="text-xs text-slate-500">
              Fresh2Cook Logistics
            </p>
          </div>

          <Link
            href="/delivery/live-tracking"
            className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
          >
            LIVE
          </Link>
        </div>
      </div>

      <div className="p-3">

        <div className="grid grid-cols-4 gap-2 mb-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border bg-white p-2 text-center"
            >
              <div className="text-xl font-bold">
                {item.value}
              </div>

              <div className="text-[10px] text-slate-500">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-3 mb-3">
          <div className="text-sm font-semibold">
            Operations Overview
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Manage deliveries, riders and dispatch from one place.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {actions.map(([title,icon,href]) => (
            <Link
              key={String(href)}
              href={String(href)}
              className="rounded-xl border bg-white p-3 shadow-sm"
            >
              <div className="text-2xl">
                {icon}
              </div>

              <div className="mt-2 text-sm font-semibold">
                {title}
              </div>
            </Link>
          ))}
        </div>

      </div>

    </main>
  );
}
