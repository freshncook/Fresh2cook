"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function FranchiseMasterPage() {
  const [franchises, setFranchises] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-franchises"
      ) || "[]"
    );

    setFranchises(data);
  }

  const totalRevenue =
    franchises.reduce(
      (sum, item) =>
        sum +
        Number(
          item.revenue || 0
        ),
      0
    );

  const totalStores =
    franchises.length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Franchise Master Dashboard
        </h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Franchise</p>
            <h2 className="text-3xl font-bold text-blue-600">
              {totalStores}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Revenue</p>
            <h2 className="text-3xl font-bold text-green-600">
              Ã¢â€šÂ¹{totalRevenue}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Growth Rate</p>
            <h2 className="text-3xl font-bold text-purple-600">
              18%
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Active Stores</p>
            <h2 className="text-3xl font-bold text-orange-600">
              {totalStores}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Franchise Network
          </h2>

          <div className="space-y-4">

            {franchises.map(
              (item, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 flex justify-between"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.name}
                    </h3>

                    <p>
                      {item.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      Ã¢â€šÂ¹{item.revenue}
                    </p>

                    <p>
                      {item.orders} Orders
                    </p>
                  </div>
                </div>
              )
            )}

            {franchises.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                No Franchise Data Found
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}








