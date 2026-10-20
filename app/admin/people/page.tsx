"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";

/*
 * Admin > People — 4 sections in one place:
 *   1 Customers  2 Processing staff  3 Riders  4 Admins
 * KYC review (documents, address + GPS, reference), approve / reject, staff salary + wallet.
 */

type Tab = "customers" | "staff" | "riders" | "admins";
type Kyc = Record<string, unknown> & { status?: string; note?: string; lat?: number | null; lng?: number | null; salary?: number };
type Month = { from: string; label: string; orders: number; salary: number; incentive: number; advance: number; paid: number; balance: number };

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const day = (v: string | null) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "-");
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "customers", label: "Customers", icon: "🛒" },
  { key: "staff", label: "Processing staff", icon: "📦" },
  { key: "riders", label: "Riders", icon: "🛵" },
  { key: "admins", label: "Admins", icon: "🛡" },
];
const DOC_LABELS: [string, string][] = [
  ["photo", "Photo"],
  ["aadhaarFront", "Aadhaar front"],
  ["aadhaarBack", "Aadhaar back"],
  ["license", "Licence"],
  ["rc", "RC"],
  ["pan", "PAN"],
];

function StatusChip({ s }: { s?: string }) {
  const cls =
    s === "Approved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s === "Submitted"
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : s === "Rejected"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${cls}`}>{s || "Incomplete"}</span>;
}

export default function PeoplePage() {
  const [tab, setTab] = useState<Tab>("riders");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [ledger, setLedger] = useState<{ id: number; type: "Advance" | "Paid"; amount: string; note: string } | null>(null);
  const [salary, setSalary] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<{ staff: number; riders: number }>({ staff: 0, riders: 0 });

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (t && TABS.some((x) => x.key === t)) setTab(t);
  }, []);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/people?tab=${t}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Could not load");
      setRows(j[t] || []);
      fetch("/api/admin/people?tab=summary", { cache: "no-store" })
        .then((x) => x.json())
        .then((x) => x?.pending && setPending(x.pending))
        .catch(() => undefined);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOpen(null);
    void load(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }, [tab, load]);

  async function post(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/people", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Failed");
      setMsg({ ok: true, text: ok });
      setLedger(null);
      await load(tab);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }

  const kw = q.trim().toLowerCase();
  const list = rows.filter((r) => !kw || `${r.name} ${r.mobile}`.toLowerCase().includes(kw));

  function KycDetail({ kind, r }: { kind: "rider" | "staff"; r: Record<string, unknown> }) {
    const k = (r.kyc || {}) as Kyc;
    const miss = (r.missing || []) as string[];
    const docs = DOC_LABELS.filter(([key]) => kind === "rider" || !["license", "rc"].includes(key));
    return (
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {docs.map(([key, label]) => {
              const url = k[key] as string | undefined;
              return url ? (
                <a key={key} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-slate-200 bg-white text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={label} className="aspect-square w-full object-cover" />
                  <div className="bg-emerald-50 py-0.5 text-[10px] font-bold text-emerald-700">✓ {label}</div>
                </a>
              ) : (
                <div key={key} className="overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white text-center">
                  <div className="flex aspect-square items-center justify-center text-xl text-slate-300">—</div>
                  <div className="py-0.5 text-[10px] font-bold text-rose-600">✕ {label}</div>
                </div>
              );
            })}
          </div>
          {miss.length > 0 && <p className="mt-1.5 text-[11px] text-rose-600">Missing: {miss.join(", ")}</p>}
        </div>
        <div className="space-y-1.5 text-[12px]">
          <div>
            <span className="text-slate-500">Address: </span>
            <b>{String(k.address || "-")}</b>
            {k.pincode ? ` - ${k.pincode}` : ""}
          </div>
          <div>
            <span className="text-slate-500">Landmark: </span>
            <b>{String(k.landmark || "-")}</b>
          </div>
          <div>
            <span className="text-slate-500">GPS: </span>
            {k.lat != null && k.lng != null ? (
              <a href={`https://www.google.com/maps?q=${k.lat},${k.lng}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">
                {String(k.lat)}, {String(k.lng)} · open map
              </a>
            ) : (
              <b className="text-rose-600">not added</b>
            )}
          </div>
          {kind === "rider" && (
            <div>
              <span className="text-slate-500">Reference: </span>
              <b>{String(k.refName || "-")}</b> {k.refMobile ? <a href={`tel:${k.refMobile}`} className="text-emerald-700 underline">{String(k.refMobile)}</a> : null}
            </div>
          )}
          {k.note ? <div className="rounded bg-rose-50 px-2 py-1 text-[11px] text-rose-700">Note: {String(k.note)}</div> : null}
          <div className="flex gap-1.5 pt-1">
            <button disabled={busy} onClick={() => void post({ action: "kycStatus", kind, id: r.id, status: "Approved" }, `${r.name} approved`)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50">
              ✓ Approve
            </button>
            <button
              disabled={busy}
              onClick={() => {
                const note = window.prompt("Reason for rejection (shown to the person)") || "";
                void post({ action: "kycStatus", kind, id: r.id, status: "Rejected", note }, `${r.name} rejected`);
              }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-700"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold text-[#063f3d]">👥 People</h1>
          <p className="text-[11px] text-slate-500">Customers · Processing staff · Riders · Admins — KYC, approval and wallets</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or mobile" className="w-48 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12px]" />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl border px-2 py-2 text-left transition ${tab === t.key ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Section {i + 1}</div>
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
              {t.icon} {t.label}
              {(t.key === "staff" || t.key === "riders") && pending[t.key] > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white" title="KYC waiting for review">
                  {pending[t.key]} new
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {msg && <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="py-10 text-center text-[12px] text-slate-400">Loading…</p>
        ) : list.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-slate-400">Nobody here yet.</p>
        ) : tab === "customers" ? (
          <table className="w-full min-w-[640px] text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-1.5">Customer</th>
                <th className="px-1 py-1.5">Mobile</th>
                <th className="px-1 py-1.5">Code</th>
                <th className="px-1 py-1.5 text-right">Orders</th>
                <th className="px-1 py-1.5 text-right">Spent</th>
                <th className="px-1 py-1.5">Joined</th>
                <th className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={String(c.id)} className="border-t border-slate-50">
                  <td className="px-3 py-1.5 font-semibold">{String(c.name)}</td>
                  <td className="px-1 py-1.5">{String(c.mobile)}</td>
                  <td className="px-1 py-1.5 font-mono text-[11px]">{String(c.referralCode || "")}</td>
                  <td className="px-1 py-1.5 text-right">{Number(c.orders)}</td>
                  <td className="px-1 py-1.5 text-right font-semibold">{rupees(Number(c.spent))}</td>
                  <td className="px-1 py-1.5 text-slate-500">{day(String(c.joined))}</td>
                  <td className="px-3 py-1.5 text-right">
                    <Link href={`/admin/customers/${c.mobile}`} className="text-[11px] font-bold text-emerald-700">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[720px] text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-1.5">{tab === "riders" ? "Rider" : tab === "admins" ? "Admin" : "Staff"}</th>
                <th className="px-1 py-1.5">Mobile</th>
                <th className="px-1 py-1.5">KYC</th>
                <th className="px-1 py-1.5">Docs</th>
                <th className="px-1 py-1.5 text-right">{tab === "riders" ? "Deliveries" : "Packed (30d)"}</th>
                <th className="px-1 py-1.5">{tab === "riders" ? "UPI" : "This month balance"}</th>
                <th className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const k = (r.kyc || {}) as Kyc;
                const id = Number(r.id);
                const miss = (r.missing || []) as string[];
                const w = r.wallet as { salary: number; months: Month[]; reward: number } | undefined;
                return (
                  <Fragment key={id}>
                    <tr className="border-t border-slate-50">
                      <td className="px-3 py-1.5">
                        <button onClick={() => setOpen(open === id ? null : id)} className="flex items-center gap-2 text-left">
                          {k.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={String(k.photo)} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold">{String(r.name).slice(0, 1)}</span>
                          )}
                          <span>
                            <b>{String(r.name)}</b>
                            <span className="block text-[10px] text-slate-400">
                              #{id}
                              {tab === "riders" ? ` · ${r.vehicle} · ${r.approvalStatus}` : `${r.role === "SUPER_ADMIN" ? " · Admin" : " · Processing"}${r.active ? "" : " · login off"}`}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-1 py-1.5">{String(r.mobile)}</td>
                      <td className="px-1 py-1.5">
                        <StatusChip s={k.status} />
                      </td>
                      <td className="px-1 py-1.5">{miss.length ? <span className="text-rose-600">{miss.length} missing</span> : <span className="text-emerald-700">✓ complete</span>}</td>
                      <td className="px-1 py-1.5 text-right">{tab === "riders" ? Number(r.completedDeliveries || 0) : Number(r.packedMonth || 0)}</td>
                      <td className="px-1 py-1.5">
                        {tab === "riders" ? (r.upi ? <span className="font-mono text-[11px]">{String(r.upi)}</span> : <span className="text-slate-400">-</span>) : <b>{rupees(w?.months[0]?.balance || 0)}</b>}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <button onClick={() => setOpen(open === id ? null : id)} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">
                          {open === id ? "Close" : "Review"}
                        </button>
                      </td>
                    </tr>
                    {open === id && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={7} className="space-y-3 px-3 py-3">
                          <KycDetail kind={tab === "riders" ? "rider" : "staff"} r={r} />
                          {tab === "riders" && (
                            <Link href="/admin/rider-payouts" className="inline-block text-[12px] font-bold text-emerald-700">
                              Weekly payouts, advance & UPI → Rider Payouts
                            </Link>
                          )}
                          {tab !== "riders" && w && (
                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <b className="mr-auto text-[13px]">👛 Wallet (monthly)</b>
                                <span className="text-[11px] text-slate-500">Salary / month</span>
                                <input
                                  value={salary[id] ?? String(w.salary || "")}
                                  onChange={(e) => setSalary({ ...salary, [id]: e.target.value.replace(/\D/g, "") })}
                                  className="w-24 rounded border border-slate-300 px-1.5 py-1 text-right text-[12px]"
                                  placeholder="₹"
                                />
                                <button disabled={busy} onClick={() => void post({ action: "salary", id, salary: Number(salary[id] ?? w.salary) }, "Salary saved")} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-bold text-white">
                                  Save
                                </button>
                                <button onClick={() => setLedger({ id, type: "Advance", amount: "", note: "" })} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                                  + Advance
                                </button>
                                <button onClick={() => setLedger({ id, type: "Paid", amount: String(Math.max(0, w.months[0]?.balance || 0)), note: "" })} className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                  Pay
                                </button>
                                <button
                                  disabled={busy}
                                  onClick={() => void post({ action: "active", id, active: !r.active }, r.active ? "Login turned off" : "Login turned on")}
                                  className="rounded border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600"
                                >
                                  {r.active ? "Turn login off" : "Turn login on"}
                                </button>
                              </div>
                              {ledger?.id === id && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className="self-center text-[12px] font-bold">{ledger.type}:</span>
                                  <input value={ledger.amount} onChange={(e) => setLedger({ ...ledger, amount: e.target.value.replace(/\D/g, "") })} placeholder="₹ amount" className="w-24 rounded border border-slate-300 px-1.5 py-1 text-right text-[12px]" />
                                  <input value={ledger.note} onChange={(e) => setLedger({ ...ledger, note: e.target.value })} placeholder="Note" className="w-40 rounded border border-slate-300 px-1.5 py-1 text-[12px]" />
                                  <button disabled={busy} onClick={() => void post({ action: "ledger", id, type: ledger.type, amount: Number(ledger.amount), note: ledger.note }, `${ledger.type} recorded`)} className="rounded bg-emerald-600 px-2 text-[11px] font-bold text-white">
                                    Save
                                  </button>
                                  <button onClick={() => setLedger(null)} className="px-1 text-slate-500">
                                    ✕
                                  </button>
                                </div>
                              )}
                              <table className="mt-2 w-full text-[11px]">
                                <thead>
                                  <tr className="text-left text-[10px] uppercase text-slate-400">
                                    <th>Month</th>
                                    <th className="text-right">Orders</th>
                                    <th className="text-right">Salary</th>
                                    <th className="text-right">Incentive</th>
                                    <th className="text-right">Advance</th>
                                    <th className="text-right">Paid</th>
                                    <th className="text-right">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {w.months.map((m) => (
                                    <tr key={m.from} className="border-t border-slate-50">
                                      <td className="py-1">{m.label}</td>
                                      <td className="text-right">{m.orders}</td>
                                      <td className="text-right">{rupees(m.salary)}</td>
                                      <td className="text-right text-emerald-700">+{rupees(m.incentive)}</td>
                                      <td className="text-right text-amber-700">{m.advance ? `− ${rupees(m.advance)}` : "-"}</td>
                                      <td className="text-right text-blue-700">{m.paid ? `− ${rupees(m.paid)}` : "-"}</td>
                                      <td className="text-right font-bold">{rupees(m.balance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <p className="mt-1 text-[10px] text-slate-400">Incentive = {rupees(w.reward)} per packed order (Settings). Balance = Salary + Incentive − Advance − Paid.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
