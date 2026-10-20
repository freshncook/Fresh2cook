"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [items, setItems] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [unit, setUnit] =
    useState("Kg");

  useEffect(() => {
    loadInventory();
  }, []);

  function loadInventory() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-inventory"
      ) || "[]"
    );

    setItems(data);
  }

  function addItem() {
    if (!name || !stock) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const item = {
      id: Date.now(),
      name,
      stock,
      unit,
      updatedAt:
        new Date().toLocaleDateString(),
    };

    const updated = [
      item,
      ...items,
    ];

    localStorage.setItem(
      "freshcut-inventory",
      JSON.stringify(updated)
    );

    setItems(updated);

    setName("");
    setStock("");

    alert(
      "Inventory Added"
    );
  }

  function updateStock(
    id: number,
    value: string
  ) {
    const updated =
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: value,
              updatedAt:
                new Date().toLocaleDateString(),
            }
          : item
      );

    localStorage.setItem(
      "freshcut-inventory",
      JSON.stringify(updated)
    );

    setItems(updated);
  }

  function deleteItem(
    id: number
  ) {
    if (
      !confirm(
        "Delete Item?"
      )
    )
      return;

    const updated =
      items.filter(
        (item) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-inventory",
      JSON.stringify(updated)
    );

    setItems(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Inventory Management
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add Inventory
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Item Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
              placeholder="Stock"
              className="border p-3 rounded-xl"
            />

            <select
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            >
              <option>Kg</option>
              <option>Gram</option>
              <option>Piece</option>
              <option>Packet</option>
              <option>Box</option>
            </select>

          </div>

          <button
            onClick={addItem}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Add Item
          </button>

        </div>

        <div className="space-y-4">

          {items.map(
            (item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
              >

                <div>

                  <h2 className="text-xl font-bold">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    Updated:
                    {" "}
                    {item.updatedAt}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <input
                    value={item.stock}
                    onChange={(e) =>
                      updateStock(
                        item.id,
                        e.target.value
                      )
                    }
                    className="border p-2 rounded-lg w-24"
                  />

                  <span>
                    {item.unit}
                  </span>

                  <button
                    onClick={() =>
                      deleteItem(
                        item.id
                      )
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-xl"
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








