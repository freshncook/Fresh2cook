"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function VendorMobilePage() {
  const [vendors, setVendors] =
    useState<any[]>([]);

  useEffect(() => {
    loadVendors();
  }, []);

  function loadVendors() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-vendors"
      ) || "[]"
    );

    setVendors(data);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Vendor Mobile Panel
        </h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Vendors</p>
            <h2 className="text-3xl font-bold">
              {vendors.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Active Vendors</p>
            <h2 className="text-3xl font-bold text-green-600">
              {vendors.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Pending Orders</p>
            <h2 className="text-3xl font-bold text-orange-600">
              0
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Completed Orders</p>
            <h2 className="text-3xl font-bold text-blue-600">
              0
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Vendor Directory
          </h2>

          <div className="space-y-4">

            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 flex justify-between"
              >
                <div>
                  <h3 className="font-bold">
                    {vendor.name}
                  </h3>

                  <p>
                    {vendor.phone}
                  </p>
                </div>

                <div className="text-green-600 font-bold">
                  Active
                </div>
              </div>
            ))}

            {vendors.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No Vendors Found
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}








