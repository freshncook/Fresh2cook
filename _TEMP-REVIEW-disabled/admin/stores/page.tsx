"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function StoresPage() {
  const [stores, setStores] =
    useState<any[]>([]);

  const [storeName, setStoreName] =
    useState("");

  const [city, setCity] =
    useState("");

  const [manager, setManager] =
    useState("");

  useEffect(() => {
    loadStores();
  }, []);

  function loadStores() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-stores"
      ) || "[]"
    );

    setStores(data);
  }

  function addStore() {
    if (
      !storeName ||
      !city
    ) {
      alert("Fill Required Fields");
      return;
    }

    const newStore = {
      id: Date.now(),
      storeName,
      city,
      manager,
      sales: 0,
      inventory: 0,
      status: "Active",
    };

    const updated = [
      newStore,
      ...stores,
    ];

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStoreName("");
    setCity("");
    setManager("");

    loadStores();
  }

  function updateSales(
    id: number
  ) {
    const updated =
      stores.map((store) =>
        store.id === id
          ? {
              ...store,
              sales:
                store.sales + 1000,
            }
          : store
      );

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStores(updated);
  }

  function updateInventory(
    id: number
  ) {
    const updated =
      stores.map((store) =>
        store.id === id
          ? {
              ...store,
              inventory:
                store.inventory + 50,
            }
          : store
      );

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStores(updated);
  }

  const totalSales =
    stores.reduce(
      (sum, store) =>
        sum + store.sales,
      0
    );

  const totalInventory =
    stores.reduce(
      (sum, store) =>
        sum +
        store.inventory,
      0
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Multi Store ERP
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">
            <p>Total Stores</p>
            <h2 className="text-4xl font-bold">
              {stores.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p>Total Sales</p>
            <h2 className="text-4xl font-bold text-green-600">
              Ã¢â€šÂ¹{totalSales}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p>Total Inventory</p>
            <h2 className="text-4xl font-bold text-blue-600">
              {totalInventory}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add New Store
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              placeholder="Store Name"
              value={storeName}
              onChange={(e) =>
                setStoreName(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="City"
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Manager"
              value={manager}
              onChange={(e) =>
                setManager(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={addStore}
            className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl"
          >
            Add Store
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {stores.map(
            (store) => (

              <div
                key={store.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {
                    store.storeName
                  }
                </h2>

                <p>
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â {store.city}
                </p>

                <p>
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¼{" "}
                  {store.manager}
                </p>

                <p className="mt-2 font-bold text-green-600">
                  Sales:
                  {" "}
                  Ã¢â€šÂ¹
                  {store.sales}
                </p>

                <p className="font-bold text-blue-600">
                  Inventory:
                  {" "}
                  {
                    store.inventory
                  }
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">

                  <button
                    onClick={() =>
                      updateSales(
                        store.id
                      )
                    }
                    className="bg-green-600 text-white py-2 rounded-xl"
                  >
                    Add Sale
                  </button>

                  <button
                    onClick={() =>
                      updateInventory(
                        store.id
                      )
                    }
                    className="bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Add Stock
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








