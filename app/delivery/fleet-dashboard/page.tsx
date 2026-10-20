"use client";

import Link from "next/link";

export default function FleetDashboard() {
  const items = [
    {
      title: "Forecast",
      url: "/delivery/fleet-forecast",
    },
    {
      title: "Zones",
      url: "/delivery/fleet-zones",
    },
    {
      title: "Productivity",
      url: "/delivery/fleet-productivity",
    },
    {
      title: "Insights",
      url: "/delivery/fleet-insights",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Fleet AI Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold">
              {item.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}





