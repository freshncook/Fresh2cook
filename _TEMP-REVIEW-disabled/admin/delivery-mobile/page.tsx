"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryMobilePage() {
  const [boys, setBoys] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-delivery-boys"
      ) || "[]"
    );

    setBoys(data);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Delivery Boy Mobile Panel
        </h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Riders</p>
            <h2 className="text-3xl font-bold">
              {boys.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Online Riders</p>
            <h2 className="text-3xl font-bold text-green-600">
              {boys.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Assigned Orders</p>
            <h2 className="text-3xl font-bold text-orange-600">
              0
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Delivered Today</p>
            <h2 className="text-3xl font-bold text-blue-600">
              0
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Delivery Team
          </h2>

          <div className="space-y-4">

            {boys.map((boy, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 flex justify-between"
              >
                <div>
                  <h3 className="font-bold">
                    {boy.name}
                  </h3>

                  <p>
                    {boy.phone}
                  </p>
                </div>

                <div className="text-green-600 font-bold">
                  Online
                </div>
              </div>
            ))}

            {boys.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No Delivery Boys Found
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}








