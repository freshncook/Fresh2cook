"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ExecutiveFleetDashboard() {
  const [report, setReport] =
    useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(
      "/api/fleet-daily-report"
    );

    const json =
      await res.json();

    setReport(json);
  }

  if (!report) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Executive Fleet Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl shadow p-5">
          <p>Total Riders</p>
          <h2 className="text-3xl font-bold">
            {report.totalRiders}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p>Total Orders</p>
          <h2 className="text-3xl font-bold">
            {report.totalOrders}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p>Total Assignments</p>
          <h2 className="text-3xl font-bold">
            {report.totalAssignments}
          </h2>
        </div>

      </div>

    </div>
  );
}









