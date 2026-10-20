"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function FleetAIPage() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(
      "/api/admin-fleet-ai"
    );

    const json =
      await res.json();

    setData(json);
  }

  if (!data)
    return (
      <div className="p-5">
        Loading...
      </div>
    );

  return (
    <div className="p-5">

      <h1 className="text-3xl font-bold mb-6">
        Fleet Intelligence AI
      </h1>

      <div className="grid md:grid-cols-5 gap-5">

        <Card
          title="Online Riders"
          value={data.onlineRiders}
        />

        <Card
          title="Late Deliveries"
          value={data.lateAssignments}
        />

        <Card
          title="Delivered"
          value={data.deliveredOrders}
        />

        <Card
          title="Pending"
          value={data.pendingOrders}
        />

        <Card
          title="Fleet Score"
          value={data.fleetScore}
        />

      </div>

      <div className="bg-white rounded-2xl shadow p-5 mt-6">

        <h2 className="text-xl font-bold mb-4">
          AI Status
        </h2>

        <ul className="space-y-2">
          <li>
            ✅ Risk Engine Active
          </li>
          <li>
            ✅ Rider Scoring Active
          </li>
          <li>
            ✅ Suggestions Active
          </li>
          <li>
            ✅ Prediction Engine Active
          </li>
        </ul>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}: any) {
  return (
    <div className="bg-white shadow rounded-2xl p-5">
      <p>{title}</p>
      <h2 className="text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}











