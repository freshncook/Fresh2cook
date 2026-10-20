"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function GrowthOSPage() {
  const [auto, setAuto] = useState<any>({});
  const [cashback, setCashback] = useState<any>({});
  const [renewal, setRenewal] = useState<any>({});

  useEffect(() => {
    fetch("/api/whatsapp-automation")
      .then((r) => r.json())
      .then(setAuto)
      .catch(() => {});

    fetch("/api/cashback-engine")
      .then((r) => r.json())
      .then(setCashback)
      .catch(() => {});

    fetch("/api/membership-renewal")
      .then((r) => r.json())
      .then(setRenewal)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-5">
      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Fresh2Cook Growth OS
        </h1>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <AdminStatCard
            title="Cashback Today"
            value={`₹${cashback?.cashbackToday || 0}`}
            color="text-green-600"
          />

          <AdminStatCard
            title="Month Cashback"
            value={`₹${cashback?.cashbackMonth || 0}`}
            color="text-blue-600"
          />

          <AdminStatCard
            title="Renewal Rate"
            value={`${renewal?.renewalRate || 0}%`}
            color="text-purple-600"
          />

        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-2xl font-bold mb-5">
            WhatsApp Automation Center
          </h2>

          <div className="space-y-3">

            {auto?.automations?.length ? (
              auto.automations.map(
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
                No Automations Found
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}









