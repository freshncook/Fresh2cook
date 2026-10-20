"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function VendorPortalPage() {
  const [vendors, setVendors] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [phone, setPhone] =
    useState("");

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

  function addVendor() {
    if (
      !name ||
      !company ||
      !phone
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const updated = [
      {
        id: Date.now(),
        name,
        company,
        phone,
        orders: 0,
        amount: 0,
        status: "Active",
        joined:
          new Date().toLocaleDateString(),
      },
      ...vendors,
    ];

    localStorage.setItem(
      "freshcut-vendors",
      JSON.stringify(updated)
    );

    setName("");
    setCompany("");
    setPhone("");

    loadVendors();
  }

  function removeVendor(
    id: number
  ) {
    const updated =
      vendors.filter(
        (vendor: any) =>
          vendor.id !== id
      );

    localStorage.setItem(
      "freshcut-vendors",
      JSON.stringify(updated)
    );

    loadVendors();
  }

  const totalVendors =
    vendors.length;

  const activeVendors =
    vendors.filter(
      (v: any) =>
        v.status ===
        "Active"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-5">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Vendor Portal
        </h1>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-5 rounded-xl shadow">

            <p>
              Total Vendors
            </p>

            <h2 className="text-3xl font-bold text-blue-600">
              {totalVendors}
            </h2>

          </div>

          <div className="bg-white p-5 rounded-xl shadow">

            <p>
              Active Vendors
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              {activeVendors}
            </h2>

          </div>

          <div className="bg-white p-5 rounded-xl shadow">

            <p>
              Monthly Purchase
            </p>

            <h2 className="text-3xl font-bold text-purple-600">
              ₹
              {vendors.reduce(
                (
                  sum: number,
                  item: any
                ) =>
                  sum +
                  Number(
                    item.amount || 0
                  ),
                0
              )}
            </h2>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add Vendor
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Vendor Name"
              className="border p-3 rounded-2xl"
            />

            <input
              value={company}
              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }
              placeholder="Company Name"
              className="border p-3 rounded-2xl"
            />

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Mobile Number"
              className="border p-3 rounded-2xl"
            />

          </div>

          <button
            onClick={addVendor}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Save Vendor
          </button>

        </div>

        <div className="space-y-6">

          {vendors.map(
            (vendor: any) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl shadow p-5"
              >

                <div className="flex flex-col md:flex-row md:justify-between gap-5">

                  <div>

                    <h2 className="text-xl font-bold">
                      {vendor.name}
                    </h2>

                    <p>
                      {vendor.company}
                    </p>

                    <p>
                      📞 {vendor.phone}
                    </p>

                    <p className="text-green-600 font-bold mt-2">
                      {vendor.status}
                    </p>

                    <p className="mt-2">
                      Joined:
                      {" "}
                      {vendor.joined}
                    </p>

                  </div>

                  <div className="text-right">

                    <p>
                      Orders:
                      {" "}
                      {vendor.orders}
                    </p>

                    <p>
                      Purchase:
                      {" "}
                      ₹{vendor.amount}
                    </p>

                    <button
                      onClick={() =>
                        removeVendor(
                          vendor.id
                        )
                      }
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-2xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}












