"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AutoPurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { generateOrders(); }, []);

  function generateOrders() {
    try {
      const products = JSON.parse(localStorage.getItem("freshcut-products") || "[]");
      const purchaseOrders = products
        .filter((item:any) => Number(item.stock || 0) < 20)
        .map((item:any) => ({
          id: Date.now() + Math.random(),
          product: item.name,
          currentStock: item.stock,
          requiredQty: 100 - Number(item.stock || 0),
          vendor: item.vendor || "Default Vendor",
          status: "Pending",
          date: new Date().toLocaleDateString(),
        }));
      setOrders(purchaseOrders);
    } catch { setOrders([]); }
  }

  function updateStatus(id:number, status:string) {
    setOrders(prev => prev.map(item => item.id === id ? {...item, status} : item));
  }

  const pending = orders.filter(o => o.status === "Pending").length;
  const approved = orders.filter(o => o.status === "Approved").length;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <Header title="Auto Purchase Orders" subtitle="Automatically identify low-stock products and prepare purchase orders." />

        <div className="grid gap-5 md:grid-cols-3">
          <Kpi title="Generated PO" value={orders.length} />
          <Kpi title="Pending" value={pending} red />
          <Kpi title="Approved" value={approved} green />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="border-b p-6">
            <h2 className="text-lg font-extrabold text-[#123b38]">Purchase Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Product","Current Stock","Required","Vendor","Status","Action"].map(h => (
                    <th key={h} className="whitespace-nowrap px-5 py-4 text-left font-bold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(item => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-bold text-[#123b38]">{item.product}</td>
                    <td className="px-5 py-4">{item.currentStock}</td>
                    <td className="px-5 py-4 font-bold text-red-600">{item.requiredQty}</td>
                    <td className="px-5 py-4">{item.vendor}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                        item.status === "Sent To Vendor" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(item.id,"Approved")} className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Approve</button>
                        <button onClick={() => { updateStatus(item.id,"Sent To Vendor"); alert("Purchase Order Sent To Vendor"); }} className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Send</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!orders.length && <div className="p-12 text-center text-sm text-slate-500">No low-stock purchase orders generated.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({title,subtitle}:any) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}
function Kpi({title,value,green,red}:any) {
  return <div className={`rounded-2xl border p-6 shadow-md ${green?"border-emerald-100 bg-emerald-50":red?"border-red-100 bg-red-50":"border-slate-200 bg-white"}`}><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>;
}









