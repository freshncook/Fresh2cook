"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Page() {
  const [alerts, setAlerts] =
    useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(
      "/api/fleet-risk-alerts"
    );

    const json =
      await res.json();

    setAlerts(
      json.alerts || []
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Fleet Alerts
      </h1>

      <div className="space-y-3">

        {alerts.map(
          (alert) => (
            <div
              key={alert.id}
              className="bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              Assignment #
              {
                alert.orderId
              }
              {" "}
              is delayed
            </div>
          )
        )}

      </div>

    </div>
  );
}








