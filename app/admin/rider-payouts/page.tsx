"use client";

import { Fragment, useEffect, useState } from "react";

/*
 * Admin > Rider Payouts — weekly.
 * Earnings − Advance − Paid = Balance. Give advance, pay, or mark a requested payout as paid.
 */

type Week = { from: string; label: string; deliveries: number; earnings: number; advance: number; paid: number; balance: number };
type Rider = {
  id: number;
  name: string;
  mobile: string;
  vehicle: string;
  upi: string;
  earned: number;
  advanceTotal: number;
  paidTotal: number;
  pending: number;
  balance: number;
  weeks: Week[];
  payouts: { id: number; amount: number; status: string; requestedAt: string }[];
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function RiderPayoutsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{ riderId: number; action: "advance" | "pay"; amount: string; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  async function load() {
    const r = await fetch("/api/admin/rider-payouts", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j.success) return setMsg({ ok: false, text: j.error || "Could not load" });
    setRiders(j.riders);
  }
  useEffect(() => {
    void load();
  }, []);

  async function post(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/rider-payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Failed");
      setMsg({ ok: true, text: ok });
      setForm(null);
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }

  const due = riders.reduce((s, r) => s + Math.max(0, r.balance), 0);

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold text-[#063f3d]">🛵 Rider Payouts (weekly)</h1>
          <p className="text-[11px] text-slate-500">Balance = Earnings − Advance − Paid. Pay to the rider&apos;s UPI ID.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Total due {rupees(due)}</span>
      </div>
      {msg && <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-1.5">Rider</th>
              <th className="px-1 py-1.5">UPI</th>
              <th className="px-1 py-1.5 text-right">This week</th>
              <th className="px-1 py-1.5 text-right">Earned</th>
              <th className="px-1 py-1.5 text-right">Advance</th>
              <th className="px-1 py-1.5 text-right">Paid</th>
              <th className="px-1 py-1.5 text-right">Balance</th>
              <th className="px-3 py-1.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r) => {
              const pending = r.payouts.filter((p) => p.status === "Pending");
              return (
                <Fragment key={r.id}>
                  <tr className="border-t border-slate-50 align-top">
                    <td className="px-3 py-2">
                      <button onClick={() => setOpen(open === r.id ? null : r.id)} className="text-left font-bold text-slate-900">
                        {open === r.id ? "▾" : "▸"} {r.name}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        #{r.id} · {r.vehicle}
                      </div>
                    </td>
                    <td className="px-1 py-2">{r.upi ? <span className="font-mono text-[11px]">{r.upi}</span> : <span className="text-rose-500">Not added</span>}</td>
                    <td className="px-1 py-2 text-right tabular-nums">
                      {rupees(r.weeks[0]?.earnings || 0)}
                      <div className="text-[10px] text-slate-400">{r.weeks[0]?.deliveries || 0} orders</div>
                    </td>
                    <td className="px-1 py-2 text-right tabular-nums">{rupees(r.earned)}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-amber-700">{r.advanceTotal ? `− ${rupees(r.advanceTotal)}` : "-"}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-blue-700">{r.paidTotal ? `− ${rupees(r.paidTotal)}` : "-"}</td>
                    <td className={`px-1 py-2 text-right font-extrabold tabular-nums ${r.balance < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {rupees(r.balance)}
                      {r.pending > 0 && <div className="text-[10px] font-semibold text-amber-600">requested {rupees(r.pending)}</div>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {pending.map((p) => (
                          <button key={p.id} disabled={busy} onClick={() => void post({ action: "markPaid", payoutId: p.id }, `${r.name}: ${rupees(p.amount)} marked paid`)} className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">
                            ✓ Paid {rupees(p.amount)}
                          </button>
                        ))}
                        <button onClick={() => setForm({ riderId: r.id, action: "pay", amount: String(Math.max(0, r.balance - r.pending)), note: "" })} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                          Pay
                        </button>
                        <button onClick={() => setForm({ riderId: r.id, action: "advance", amount: "", note: "" })} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                          Advance
                        </button>
                      </div>
                      {form?.riderId === r.id && (
                        <div className="mt-1.5 flex justify-end gap-1">
                          <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/\D/g, "") })} placeholder="₹ amount" className="w-20 rounded border border-slate-300 px-1.5 py-1 text-right" />
                          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note" className="w-28 rounded border border-slate-300 px-1.5 py-1" />
                          <button disabled={busy} onClick={() => void post({ action: form.action, riderId: r.id, amount: Number(form.amount), note: form.note }, form.action === "pay" ? "Payout recorded" : "Advance recorded")} className="rounded bg-slate-900 px-2 text-[11px] font-bold text-white">
                            Save
                          </button>
                          <button onClick={() => setForm(null)} className="px-1 text-slate-500">
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {open === r.id && (
                    <tr key={`${r.id}-w`} className="bg-slate-50/60">
                      <td colSpan={8} className="px-3 py-2">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="text-left text-[10px] uppercase text-slate-400">
                              <th>Week</th>
                              <th className="text-right">Orders</th>
                              <th className="text-right">Earnings</th>
                              <th className="text-right">Advance</th>
                              <th className="text-right">Paid</th>
                              <th className="text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.weeks.map((w) => (
                              <tr key={w.from}>
                                <td className="py-0.5">{w.label}</td>
                                <td className="text-right">{w.deliveries}</td>
                                <td className="text-right">{rupees(w.earnings)}</td>
                                <td className="text-right text-amber-700">{w.advance ? rupees(w.advance) : "-"}</td>
                                <td className="text-right text-blue-700">{w.paid ? rupees(w.paid) : "-"}</td>
                                <td className="text-right font-bold">{rupees(w.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!riders.length && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No approved riders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
