"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [vendor, setVendor] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadPurchases();
  }, []);

  function loadPurchases() {
    try {
      setPurchases(
        JSON.parse(localStorage.getItem("freshcut-purchases") || "[]")
      );
    } catch {
      setPurchases([]);
    }
  }

  function addPurchase() {
    if (!vendor || !item || !quantity || !amount) {
      alert("Fill All Fields");
      return;
    }

    const purchase = {
      id: Date.now(),
      vendor,
      item,
      quantity,
      amount,
      date: new Date().toLocaleDateString(),
    };

    const updated = [purchase, ...purchases];

    localStorage.setItem(
      "freshcut-purchases",
      JSON.stringify(updated)
    );

    setPurchases(updated);
    setVendor("");
    setItem("");
    setQuantity("");
    setAmount("");

    alert("Purchase Added Successfully");
  }

  function deletePurchase(id: number) {
    if (!confirm("Delete Purchase?")) return;

    const updated = purchases.filter((purchase) => purchase.id !== id);

    localStorage.setItem(
      "freshcut-purchases",
      JSON.stringify(updated)
    );

    setPurchases(updated);
  }

  const totalPurchase = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Purchase Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record purchases, supplier costs and procurement history.
          </p>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#123b38]">
              Add Purchase
            </h2>
            <p className="text-sm text-slate-500">
              Enter supplier and purchase details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Vendor Name"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Item Name"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              type="number"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <button
            onClick={addPurchase}
            className="mt-5 rounded-2xl bg-[#063f3d] px-7 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            + Add Purchase
          </button>
        </div>

        <div className="mb-7 rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-sm font-bold text-orange-700">
            Total Purchase Cost
          </p>
          <p className="mt-2 text-4xl font-extrabold text-[#123b38]">
            ₹{totalPurchase.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#123b38]">
                    {purchase.item}
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-slate-500">
                    <p>Vendor: {purchase.vendor}</p>
                    <p>Quantity: {purchase.quantity}</p>
                    <p>Date: {purchase.date}</p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-2xl font-extrabold text-orange-700">
                    ₹{Number(purchase.amount || 0).toLocaleString("en-IN")}
                  </p>

                  <button
                    onClick={() => deletePurchase(purchase.id)}
                    className="mt-3 rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!purchases.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              No purchase records available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










