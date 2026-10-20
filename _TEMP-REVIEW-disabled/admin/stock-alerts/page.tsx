"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function StockAlertsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  function loadInventory() {
    try {
      const data = JSON.parse(
        localStorage.getItem("freshcut-inventory") || "[]"
      );
      setItems(
        data.filter((item: any) => Number(item.stock) <= 10)
      );
    } catch {
      setItems([]);
    }
  }

  function updateStock(id: number, stock: string) {
    try {
      const inventory = JSON.parse(
        localStorage.getItem("freshcut-inventory") || "[]"
      );

      const updated = inventory.map((item: any) =>
        item.id === id ? { ...item, stock } : item
      );

      localStorage.setItem(
        "freshcut-inventory",
        JSON.stringify(updated)
      );

      loadInventory();
      alert("Stock Updated");
    } catch {
      alert("Unable to update stock");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Fresh2Cook Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
              Stock Alerts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor products requiring inventory attention.
            </p>
          </div>

          <button
            onClick={loadInventory}
            className="w-fit rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            â†» Refresh
          </button>
        </div>

        <div className="mb-7 rounded-2xl border border-red-100 bg-red-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">
                Items Running Low
              </p>
              <p className="mt-1 text-sm text-red-600">
                Products with stock at or below 10 units.
              </p>
            </div>

            <div className="text-3xl font-extrabold text-red-700">
              {items.length}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              âœ“
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-[#123b38]">
              All Stock Levels Healthy
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              No low-stock products require attention.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#123b38]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-red-600">
                      Remaining: {item.stock} {item.unit || "units"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="number"
                      defaultValue={item.stock}
                      id={`stock-${item.id}`}
                      className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    />

                    <button
                      onClick={() =>
                        updateStock(
                          item.id,
                          (
                            document.getElementById(
                              `stock-${item.id}`
                            ) as HTMLInputElement
                          ).value
                        )
                      }
                      className="rounded-xl bg-[#063f3d] px-5 py-2 text-sm font-bold text-white hover:bg-[#0a514d]"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






