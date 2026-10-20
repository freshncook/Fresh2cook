"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function VendorsPage() {
  const [vendors, setVendors] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [category, setCategory] =
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
      !mobile ||
      !category
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const vendor = {
      id: Date.now(),
      name,
      mobile,
      category,
      status: "Active",
      createdAt:
        new Date().toLocaleDateString(),
    };

    const updated = [
      vendor,
      ...vendors,
    ];

    localStorage.setItem(
      "freshcut-vendors",
      JSON.stringify(updated)
    );

    setVendors(updated);

    setName("");
    setMobile("");
    setCategory("");

    alert(
      "Vendor Added Successfully"
    );
  }

  function deleteVendor(
    id: number
  ) {
    if (
      !confirm(
        "Delete Vendor?"
      )
    )
      return;

    const updated =
      vendors.filter(
        (item) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-vendors",
      JSON.stringify(updated)
    );

    setVendors(updated);
  }

  function toggleStatus(
    id: number
  ) {
    const updated =
      vendors.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status ===
                "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      );

    localStorage.setItem(
      "freshcut-vendors",
      JSON.stringify(updated)
    );

    setVendors(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Vendor Management
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Add Vendor
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Vendor Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                )
              }
              placeholder="Mobile Number"
              className="border p-3 rounded-xl"
            />

            <input
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              placeholder="Vegetables / Fruits / Packaging"
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={addVendor}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Add Vendor
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {vendors.map(
            (vendor) => (

              <div
                key={vendor.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {vendor.name}
                </h2>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¾ {vendor.mobile}
                </p>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ {vendor.category}
                </p>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ {vendor.createdAt}
                </p>

                <div className="mt-4">

                  <span
                    className={`px-4 py-2 rounded-full ${
                      vendor.status ===
                      "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vendor.status}
                  </span>

                </div>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() =>
                      toggleStatus(
                        vendor.id
                      )
                    }
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Status
                  </button>

                  <button
                    onClick={() =>
                      deleteVendor(
                        vendor.id
                      )
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}








