"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function FranchisePage() {
  const [franchises, setFranchises] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [city, setCity] =
    useState("");

  const [phone, setPhone] =
    useState("");

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

  function addFranchise() {
    if (
      !name ||
      !city ||
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
        city,
        phone,
        status: "Active",
        createdAt:
          new Date().toLocaleDateString(),
      },
      ...franchises,
    ];

    localStorage.setItem(
      "freshcut-franchises",
      JSON.stringify(updated)
    );

    setName("");
    setCity("");
    setPhone("");

    loadData();
  }

  function removeFranchise(
    id: number
  ) {
    const updated =
      franchises.filter(
        (item) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-franchises",
      JSON.stringify(updated)
    );

    loadData();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Franchise Management
        </h1>

        <div className="bg-white rounded-xl shadow p-5 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add Franchise
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Franchise Owner"
              className="border p-3 rounded-2xl"
            />

            <input
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              placeholder="City"
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
            onClick={
              addFranchise
            }
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Add Franchise
          </button>

        </div>

        <div className="space-y-6">

          {franchises.map(
            (item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-5"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-xl font-bold">
                      {item.name}
                    </h2>

                    <p>
                      📍 {item.city}
                    </p>

                    <p>
                      📞 {item.phone}
                    </p>

                    <p className="text-green-600 font-bold mt-2">
                      {item.status}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      removeFranchise(
                        item.id
                      )
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-2xl"
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












