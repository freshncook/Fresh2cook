"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function PayoutsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    try {
      setVendors(JSON.parse(localStorage.getItem("freshcut-vendors") || "[]"));
      setPayouts(JSON.parse(localStorage.getItem("freshcut-payouts") || "[]"));
    } catch {
      setVendors([]);
      setPayouts([]);
    }
  }, []);

  function makePayment(vendor: any) {
    const amount = prompt(`Enter Payment Amount For ${vendor.name}`);
    if (!amount) return;

    const payout = {
      id: Date.now(),
      vendorId: vendor.id,
      vendor: vendor.name,
      mobile: vendor.mobile,
      amount,
      date: new Date().toLocaleDateString(),
      status: "Paid",
    };

    const updated = [payout, ...payouts];
    localStorage.setItem("freshcut-payouts", JSON.stringify(updated));
    setPayouts(updated);
    alert("Payment Recorded Successfully");
  }

  const totalPayout = payouts.reduce(
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
            Vendor Payouts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage vendor payments and payout history.
          </p>
        </div>

        <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">Total Payout</p>
          <p className="mt-2 text-4xl font-extrabold text-[#123b38]">
            â‚¹{totalPayout.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#123b38]">
                    {vendor.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {vendor.mobile || "No mobile"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {vendor.category || "Vendor"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  ACTIVE
                </span>
              </div>

              <button
                onClick={() => makePayment(vendor)}
                className="mt-5 w-full rounded-xl bg-[#063f3d] py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
              >
                Record Payment
              </button>
            </div>
          ))}

          {!vendors.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No vendors available.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#123b38]">
              Payment History
            </h2>
            <p className="text-sm text-slate-500">
              Recently recorded vendor payouts.
            </p>
          </div>

          <div className="space-y-3">
            {payouts.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-[#123b38]">{item.vendor}</p>
                  <p className="text-sm text-slate-500">{item.mobile}</p>
                </div>

                <div className="text-left md:text-right">
                  <p className="font-extrabold text-emerald-700">
                    â‚¹{Number(item.amount || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
              </div>
            ))}

            {!payouts.length && (
              <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                No payment history available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






