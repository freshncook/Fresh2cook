"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  function loadExpenses() {
    try {
      setExpenses(
        JSON.parse(localStorage.getItem("freshcut-expenses") || "[]")
      );
    } catch {
      setExpenses([]);
    }
  }

  function addExpense() {
    if (!title || !amount) {
      alert("Fill All Fields");
      return;
    }

    const updated = [
      {
        id: Date.now(),
        title,
        amount: Number(amount),
        date: new Date().toLocaleDateString(),
      },
      ...expenses,
    ];

    localStorage.setItem("freshcut-expenses", JSON.stringify(updated));
    setExpenses(updated);
    setTitle("");
    setAmount("");
  }

  function deleteExpense(id: number) {
    const updated = expenses.filter((item) => item.id !== id);
    localStorage.setItem("freshcut-expenses", JSON.stringify(updated));
    setExpenses(updated);
  }

  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
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
            Expense Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track operational expenses and business spending.
          </p>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <h2 className="text-lg font-extrabold text-[#123b38]">
            Add Expense
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Expense Title"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              type="number"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <button
              onClick={addExpense}
              className="rounded-2xl bg-[#063f3d] px-6 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
            >
              + Add Expense
            </button>
          </div>
        </div>

        <div className="mb-7 rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-700">Total Expenses</p>
          <p className="mt-2 text-4xl font-extrabold text-[#123b38]">
            ₹{totalExpense.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#123b38]">
              Expense History
            </h2>
            <p className="text-sm text-slate-500">
              Recent business expenses.
            </p>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                No Expenses Found
              </div>
            )}

            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-[#123b38]">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                </div>

                <div className="flex items-center justify-between gap-5 md:justify-end">
                  <span className="font-extrabold text-red-700">
                    ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                  </span>

                  <button
                    onClick={() => deleteExpense(item.id)}
                    className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}










