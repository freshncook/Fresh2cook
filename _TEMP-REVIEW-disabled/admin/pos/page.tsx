"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

export default function POSPage() {
  const [customer, setCustomer] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  async function generateInvoice() {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          amount: Number(amount),
          status: "Paid",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      const data = await res.json();

      setMessage(
        `Invoice Created Successfully. Order ID: ${data.id}`
      );

      setCustomer("");
      setMobile("");
      setAmount("");
    } catch (err) {
      setMessage("Error creating invoice");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        POS Billing
      </h1>

      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer Name"
          className="border p-3 w-full mb-4"
        />

        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
          className="border p-3 w-full mb-4"
        />

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Bill Amount"
          type="number"
          className="border p-3 w-full mb-4"
        />

        <button
          onClick={generateInvoice}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Generate Invoice
        </button>

        {message && (
          <div className="mt-4 text-green-700 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}








