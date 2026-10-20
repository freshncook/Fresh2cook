"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function EnterpriseV2Page() {
  const [logs, setLogs] = useState<any>({});
  const [monitor, setMonitor] = useState<any>({});

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {});

    fetch("/api/system-monitor")
      .then((r) => r.json())
      .then(setMonitor)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-5">
      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Enterprise OS V2
        </h1>

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <AdminStatCard
            title="CPU"
            value={monitor?.cpu || "0%"}
            color="text-blue-600"
          />

          <AdminStatCard
            title="Memory"
            value={monitor?.memory || "0%"}
            color="text-purple-600"
          />

          <AdminStatCard
            title="Database"
            value={monitor?.database || "OK"}
            color="text-green-600"
          />

          <AdminStatCard
            title="API"
            value={monitor?.api || "Online"}
            color="text-orange-600"
          />

        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-2xl font-bold mb-5">
            Audit Logs
          </h2>

          <div className="space-y-3">

            {logs?.logs?.length ? (
              logs.logs.map(
                (item: string, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-50 border rounded-2xl p-4"
                  >
                     {item}
                  </div>
                )
              )
            ) : (
              <div className="text-slate-500">
                No Audit Logs Found
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}









