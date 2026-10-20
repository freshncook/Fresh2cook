"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

export default function RiderDashboardPage() {
  const modules = [
    {
      title: "Rider Approvals",
      description: "Approve or reject new delivery partners.",
      href: "/admin/rider-approvals",
      icon: "âœ“",
    },
    {
      title: "Rider Documents",
      description: "Review submitted rider documents.",
      href: "/admin/rider-documents",
      icon: "â–£",
    },
    {
      title: "Rider Incentives",
      description: "Monitor delivery incentives and payouts.",
      href: "/admin/rider-incentives",
      icon: "â‚¹",
    },
    {
      title: "Leaderboard",
      description: "View rider performance rankings.",
      href: "/admin/rider-leaderboard",
      icon: "â˜…",
    },
    {
      title: "Live Tracking",
      description: "Monitor rider locations in real time.",
      href: "/admin/delivery-tracking",
      icon: "âŒ–",
    },
    {
      title: "Delivery Boys",
      description: "Manage rider profiles and vehicles.",
      href: "/admin/delivery-boys",
      icon: "R",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
            Delivery Management
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
            Rider Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Central control center for Fresh2Cook delivery operations.
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-[#063f3d] to-[#159447] p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-white/80">
            Fresh2Cook Delivery Control
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Manage your entire rider network
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Approvals, documents, tracking, incentives and performance are
            organized in one place.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f7ef] text-lg font-bold text-[#159447]">
                {module.icon}
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#123b39]">
                {module.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {module.description}
              </p>

              <div className="mt-5 text-sm font-bold text-[#159447] group-hover:underline">
                Open Module â†’
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}






