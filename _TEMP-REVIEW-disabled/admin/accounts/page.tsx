"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    try {
      setAccounts(JSON.parse(localStorage.getItem("freshcut-accounts") || "[]"));
    } catch {
      setAccounts([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <Header title="Accounts" subtitle="Manage business accounts and financial records." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Total Accounts" value={accounts.length} />
          <Kpi title="Active" value={accounts.length} />
          <Kpi title="Business Status" value="Active" />
          <Kpi title="System" value="Ready" />
        </div>
        <Panel title="Account Overview">
          {!accounts.length ? (
            <Empty text="No account records available." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-5">
                  <h3 className="font-bold text-[#123b38]">{item.name || item.title || "Account"}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.email || item.type || "Business Account"}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Header({ title, subtitle }: any) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}
function Kpi({ title, value }: any) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>;
}
function Panel({ title, children }: any) {
  return <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold text-[#123b38]">{title}</h2><div className="mt-5">{children}</div></div>;
}
function Empty({ text }: any) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{text}</div>;
}






