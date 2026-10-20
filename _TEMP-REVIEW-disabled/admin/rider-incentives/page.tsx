"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [storeName, setStoreName] = useState("");
  const [city, setCity] = useState("");
  const [manager, setManager] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  function loadStores() {
    try {
      const data = JSON.parse(
        localStorage.getItem("freshcut-stores") || "[]"
      );
      setStores(Array.isArray(data) ? data : []);
    } catch {
      setStores([]);
    }
  }

  function addStore() {
    if (!storeName.trim() || !city.trim()) {
      alert("Fill Required Fields");
      return;
    }

    const newStore = {
      id: Date.now(),
      storeName: storeName.trim(),
      city: city.trim(),
      manager: manager.trim(),
      sales: 0,
      inventory: 0,
      status: "Active",
    };

    const updated = [newStore, ...stores];

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStores(updated);
    setStoreName("");
    setCity("");
    setManager("");
  }

  function updateSales(id: number) {
    const updated = stores.map((store) =>
      store.id === id
        ? { ...store, sales: store.sales + 1000 }
        : store
    );

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStores(updated);
  }

  function updateInventory(id: number) {
    const updated = stores.map((store) =>
      store.id === id
        ? { ...store, inventory: store.inventory + 50 }
        : store
    );

    localStorage.setItem(
      "freshcut-stores",
      JSON.stringify(updated)
    );

    setStores(updated);
  }

  const totalSales = stores.reduce(
    (sum, store) => sum + Number(store.sales || 0),
    0
  );

  const totalInventory = stores.reduce(
    (sum, store) => sum + Number(store.inventory || 0),
    0
  );

  const filtered = stores.filter((store) =>
    `${store.storeName || ""} ${store.city || ""} ${store.manager || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Business Network
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Store Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage Fresh2Cook stores, sales and inventory.
            </p>
          </div>

          <button
            onClick={loadStores}
            className="rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0a504c]"
          >
            â†» Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              Total Stores
            </p>
            <p className="mt-2 text-3xl font-bold text-[#123b39]">
              {stores.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              Total Sales
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              â‚¹{totalSales}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              Total Inventory
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalInventory}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#123b39]">
            Add New Store
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447]"
            />

            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447]"
            />

            <input
              placeholder="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447]"
            />
          </div>

          <button
            onClick={addStore}
            className="mt-4 rounded-xl bg-[#159447] px-6 py-3 text-sm font-bold text-white hover:bg-[#117b3b]"
          >
            + Add Store
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Store Directory
              </h2>
              <p className="text-sm text-gray-500">
                {filtered.length} store(s)
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store, city, manager..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447] md:w-80"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No stores found.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((store) => (
                <div
                  key={store.id}
                  className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#123b39]">
                        {store.storeName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {store.city}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {store.status || "Active"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600">
                      Manager:{" "}
                      <b className="text-[#123b39]">
                        {store.manager || "â€”"}
                      </b>
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-gray-400">Sales</p>
                        <p className="mt-1 font-bold text-green-600">
                          â‚¹{store.sales || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-gray-400">Inventory</p>
                        <p className="mt-1 font-bold text-blue-600">
                          {store.inventory || 0}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => updateSales(store.id)}
                        className="rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                      >
                        + Sale â‚¹1,000
                      </button>

                      <button
                        onClick={() => updateInventory(store.id)}
                        className="rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        + Stock 50
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}






