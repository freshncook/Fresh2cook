"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => { loadLogs(); }, []);

  function loadLogs() {
    try { setLogs(JSON.parse(localStorage.getItem("freshcut-activity-log") || "[]")); }
    catch { setLogs([]); }
  }

  function addDemoLogs() {
    const demoLogs = [
      { id: Date.now(), action: "New Order Received", user: "System", date: new Date().toLocaleString() },
      { id: Date.now() + 1, action: "Product Updated", user: "Admin", date: new Date().toLocaleString() },
      { id: Date.now() + 2, action: "Customer Registered", user: "Website", date: new Date().toLocaleString() },
    ];
    localStorage.setItem("freshcut-activity-log", JSON.stringify(demoLogs));
    setLogs(demoLogs);
  }

  function clearLogs() {
    if (!confirm("Clear Activity Log?")) return;
    localStorage.removeItem("freshcut-activity-log");
    setLogs([]);
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="Activity Log" subtitle="Track important system and admin activities." />
        <div className="mb-6 flex flex-wrap gap-3">
          <button onClick={addDemoLogs} className="rounded-xl bg-[#063f3d] px-6 py-3 text-sm font-bold text-white">Generate Demo Logs</button>
          <button onClick={clearLogs} className="rounded-xl bg-red-50 px-6 py-3 text-sm font-bold text-red-700">Clear Logs</button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!logs.length ? <Empty text="No Activity Found" /> : logs.map(log => (
            <div key={log.id} className="flex items-center justify-between border-b border-slate-100 p-5 last:border-0">
              <div>
                <h2 className="font-bold text-[#123b38]">{log.action}</h2>
                <p className="mt-1 text-sm text-slate-500">{log.user}</p>
              </div>
              <span className="text-xs text-slate-400">{log.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Header({ title, subtitle }: any) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38]">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}
function Empty({ text }: any) {
  return <div className="p-12 text-center text-sm text-slate-500">{text}</div>;
}






