"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function EnterpriseOSPage() {
  const [health, setHealth] = useState<any>({});
  const [leaks, setLeaks] = useState<any>({});
  const [growth, setGrowth] = useState<any>({});
  const [ai, setAi] = useState<any>({});

  useEffect(() => {
    fetch("/api/business-health-score")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});

    fetch("/api/profit-leak-detector")
      .then((r) => r.json())
      .then(setLeaks)
      .catch(() => {});

    fetch("/api/growth-opportunities")
      .then((r) => r.json())
      .then(setGrowth)
      .catch(() => {});

    fetch("/api/ceo-ai-assistant")
      .then((r) => r.json())
      .then(setAi)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Fresh2Cook Enterprise OS
          </h1>

          <p className="text-slate-500 mt-2">
            Central Business Intelligence & Executive Control Center
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <AdminStatCard
            title="Health Score"
            value={health?.score || 0}
            color="text-emerald-600"
          />

          <AdminStatCard
            title="Revenue Health"
            value={health?.revenueHealth || 0}
            color="text-blue-600"
          />

          <AdminStatCard
            title="Customer Health"
            value={health?.customerHealth || 0}
            color="text-purple-600"
          />

          <AdminStatCard
            title="Operations Health"
            value={health?.operationsHealth || 0}
            color="text-orange-600"
          />

        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            AI CEO Assistant
          </h2>

          <div className="text-slate-700 leading-7">
            {ai?.insight || "No AI insight available"}
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow-sm p-6">

            <h2 className="text-2xl font-bold mb-5">
              Profit Leak Detector
            </h2>

            <div className="space-y-3">

              {leaks?.leaks?.length ? (
                leaks.leaks.map(
                  (item: string, index: number) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-100 rounded-2xl p-4"
                    >
                       {item}
                    </div>
                  )
                )
              ) : (
                <div className="text-slate-500">
                  No leak data available
                </div>
              )}

            </div>

          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">

            <h2 className="text-2xl font-bold mb-5">
              Growth Opportunities
            </h2>

            <div className="space-y-3">

              {growth?.opportunities?.length ? (
                growth.opportunities.map(
                  (item: string, index: number) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-100 rounded-2xl p-4"
                    >
                       {item}
                    </div>
                  )
                )
              ) : (
                <div className="text-slate-500">
                  No opportunities available
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}









