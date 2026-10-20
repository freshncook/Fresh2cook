"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ProfitLossPage() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [purchases, setPurchases] = useState(0);

  useEffect(() => { loadData(); }, []);

  function loadData() {
    try {
      const orders = JSON.parse(localStorage.getItem("freshcut-orders") || "[]");
      const expensesData = JSON.parse(localStorage.getItem("freshcut-expenses") || "[]");
      const purchasesData = JSON.parse(localStorage.getItem("freshcut-purchases") || "[]");

      setRevenue(orders.reduce((sum:number,item:any) => sum + Number(item.total || 0), 0));
      setExpenses(expensesData.reduce((sum:number,item:any) => sum + Number(item.amount || 0), 0));
      setPurchases(purchasesData.reduce((sum:number,item:any) => sum + Number(item.amount || 0), 0));
    } catch {}
  }

  const cost = expenses + purchases;
  const profit = revenue - cost;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="Profit & Loss" subtitle="Business revenue, expenses and purchase analysis." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Revenue" value={`â‚¹${revenue}`} green />
          <Kpi title="Expenses" value={`â‚¹${expenses}`} red />
          <Kpi title="Purchases" value={`â‚¹${purchases}`} />
          <Kpi title="Net Profit" value={`â‚¹${profit}`} green={profit >= 0} red={profit < 0} />
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">Financial Summary</h2>
          <div className="mt-5 space-y-4">
            <Row title="Total Revenue" value={revenue} />
            <Row title="Total Expenses" value={expenses} />
            <Row title="Total Purchases" value={purchases} />
            <div className="border-t pt-4"><Row title="Net Profit" value={profit} bold /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}
function Kpi({title,value,green,red}:any){return <div className={`rounded-2xl border p-6 shadow-sm ${green ? "border-emerald-100 bg-emerald-50" : red ? "border-red-100 bg-red-50" : "border-slate-200 bg-white"}`}><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>}
function Row({title,value,bold}:any){return <div className={`flex justify-between ${bold ? "text-xl font-extrabold" : "text-sm"}`}><span className="text-slate-600">{title}</span><strong className={value >= 0 ? "text-[#123b38]" : "text-red-600"}>â‚¹{value}</strong></div>}






