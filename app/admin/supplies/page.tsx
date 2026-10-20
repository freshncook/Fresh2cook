"use client";

import { useEffect, useState } from "react";

/*
 * Admin > Staff & Supplies
 * Packing material stock, requests from processing staff, staff packing + reward.
 */

type Supply = { key: string; name: string; unit: string; balance: number; min: number };
type Req = {
  id: number;
  staffName: string;
  items: { key: string; name: string; unit: string; qty: number; balance: number }[];
  note: string;
  status: string;
  at: number;
};
type Staff = { id: number; name: string; mobile: string; active: boolean; total: number; today: number; week: number; month: number; rewardTotal: number; rewardWeek: number };

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const when = (t: number) => new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function AdminSuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reward, setReward] = useState(5);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/supplies", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j.success) return setMsg(j.error || "Could not load");
    setSupplies(j.supplies);
    setRequests(j.requests);
    setStaff(j.staff);
    setReward(j.reward);
    setDirty(false);
  }
  useEffect(() => {
    void load();
  }, []);

  async function put(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/supplies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Failed");
      setMsg(ok);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const edit = (i: number, k: keyof Supply, v: string) => {
    const next = [...supplies];
    next[i] = { ...next[i], [k]: k === "balance" || k === "min" ? Number(v.replace(/\D/g, "") || 0) : v };
    setSupplies(next);
    setDirty(true);
  };

  const open = requests.filter((r) => r.status === "Open" || r.status === "Approved");
  const low = supplies.filter((s) => s.balance < s.min).length;

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold text-[#063f3d]">📦 Staff & Supplies</h1>
          <p className="text-[11px] text-slate-500">Packing material stock, requests from processing staff, and staff rewards ({rupees(reward)} per packed order — change in Settings)</p>
        </div>
        <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">Low stock {low}</span>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">Open requests {open.length}</span>
      </div>
      {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-800">{msg}</p>}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Requests */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">Requests from processing staff</h2>
          {requests.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-slate-400">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {requests.slice(0, 40).map((r) => (
                <li key={r.id} className="px-3 py-2 text-[12px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{r.staffName}</b>
                    <span className="text-slate-400">{when(r.at)}</span>
                    <span
                      className={`rounded px-1.5 text-[10px] font-bold ${
                        r.status === "Open" ? "bg-amber-50 text-amber-700" : r.status === "Approved" ? "bg-blue-50 text-blue-700" : r.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.status}
                    </span>
                    {(r.status === "Open" || r.status === "Approved") && (
                      <span className="ml-auto flex gap-1">
                        {r.status === "Open" && (
                          <button disabled={busy} onClick={() => void put({ action: "request", id: r.id, status: "Approved" }, "Request approved")} className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            Approve
                          </button>
                        )}
                        <button disabled={busy} onClick={() => void put({ action: "request", id: r.id, status: "Delivered" }, "Marked delivered — stock updated")} className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          ✓ Delivered
                        </button>
                        <button disabled={busy} onClick={() => void put({ action: "request", id: r.id, status: "Rejected" }, "Request rejected")} className="rounded-md border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.items.map((it) => (
                      <span key={it.key} className="rounded-md bg-slate-50 px-1.5 py-0.5 ring-1 ring-slate-200">
                        {it.name}: <b>{it.qty}</b> {it.unit} <span className="text-slate-400">(had {it.balance})</span>
                      </span>
                    ))}
                  </div>
                  {r.note && <div className="mt-1 text-slate-500">“{r.note}”</div>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Staff */}
        <section className="h-fit rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">Processing staff · packed orders & reward</h2>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-1">Name</th>
                <th className="px-1 py-1 text-right">Today</th>
                <th className="px-1 py-1 text-right">Week</th>
                <th className="px-1 py-1 text-right">Total</th>
                <th className="px-3 py-1 text-right">Reward</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-slate-50">
                  <td className="px-3 py-1.5 font-semibold">
                    {s.name} {!s.active && <span className="text-[10px] text-slate-400">(off)</span>}
                  </td>
                  <td className="px-1 py-1.5 text-right tabular-nums">{s.today}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums">{s.week}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums">{s.total}</td>
                  <td className="px-3 py-1.5 text-right font-bold text-emerald-700">
                    {rupees(s.rewardTotal)}
                    <div className="text-[10px] font-normal text-slate-400">week {rupees(s.rewardWeek)}</div>
                  </td>
                </tr>
              ))}
              {!staff.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No processing staff yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Materials */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <h2 className="text-[13px] font-extrabold">Packing materials stock</h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setSupplies([...supplies, { key: `item-${Date.now()}`, name: "", unit: "pcs", balance: 0, min: 0 }]);
                setDirty(true);
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[12px] font-bold text-slate-700"
            >
              + Add item
            </button>
            <button disabled={!dirty || busy} onClick={() => void put({ action: "supplies", list: supplies }, "Stock saved")} className="rounded-lg bg-[#159447] px-3 py-1 text-[12px] font-bold text-white disabled:opacity-40">
              Save
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-1">Item</th>
                <th className="px-1 py-1">Unit</th>
                <th className="px-1 py-1 text-right">Balance</th>
                <th className="px-1 py-1 text-right">Minimum</th>
                <th className="px-3 py-1">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {supplies.map((s, i) => (
                <tr key={s.key} className="border-t border-slate-50">
                  <td className="px-3 py-1">
                    <input value={s.name} onChange={(e) => edit(i, "name", e.target.value)} className="w-full rounded border border-slate-200 px-1.5 py-0.5" />
                  </td>
                  <td className="px-1 py-1">
                    <input value={s.unit} onChange={(e) => edit(i, "unit", e.target.value)} className="w-16 rounded border border-slate-200 px-1.5 py-0.5" />
                  </td>
                  <td className="px-1 py-1 text-right">
                    <input value={s.balance} onChange={(e) => edit(i, "balance", e.target.value)} inputMode="numeric" className="w-20 rounded border border-slate-200 px-1.5 py-0.5 text-right" />
                  </td>
                  <td className="px-1 py-1 text-right">
                    <input value={s.min} onChange={(e) => edit(i, "min", e.target.value)} inputMode="numeric" className="w-20 rounded border border-slate-200 px-1.5 py-0.5 text-right" />
                  </td>
                  <td className="px-3 py-1">
                    <span className={`rounded px-1.5 text-[10px] font-bold ${s.balance < s.min ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{s.balance < s.min ? `Low · need ${s.min - s.balance}` : "OK"}</span>
                  </td>
                  <td className="pr-2">
                    <button
                      onClick={() => {
                        setSupplies(supplies.filter((_, n) => n !== i));
                        setDirty(true);
                      }}
                      className="text-[12px] text-rose-500"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
