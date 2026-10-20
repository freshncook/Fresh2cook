"use client";

import { useEffect, useMemo, useState } from "react";
import KycForm, { type Kyc } from "@/components/kyc-form";

/*
 * Processing staff side panels (used by the Processing Dashboard):
 *   StaffCard        — who is logged in + today's packing / reward
 *   MyPackingPanel   — my packed orders list + reward
 *   SuppliesPanel    — packing material stock, tick + request from admin
 *   HelpPanel        — troubleshooting: late orders, orders waiting for rider, tips
 */

export type StaffWallet = {
  salary: number;
  reward: number;
  months: { from: string; label: string; orders: number; salary: number; incentive: number; advance: number; paid: number; balance: number }[];
  totals: { incentive: number; advance: number; paid: number; thisMonthBalance: number };
  ledger: { id: number; type: string; amount: number; note: string; at: number }[];
};

export type MeData = {
  me: { id: number; name: string; mobile: string; role: string; since: string; photo?: string };
  kyc: Kyc & { missing: string[] };
  wallet: StaffWallet | null;
  stats: {
    total: number;
    today: number;
    week: number;
    month: number;
    cancelled: number;
    reward: number;
    rewardTotal: number;
    rewardWeek: number;
    rewardToday: number;
    avgMinutes: number | null;
    accepted: number;
    prepared: number;
    crossChecked: number;
    stickers: number;
  };
  packed: { id: number; customer: string; status: string; amount: number; items: number; at: string | null; reward: number }[];
  supplies: { key: string; name: string; unit: string; balance: number; min: number }[];
  requests: { id: number; items: { name: string; qty: number; unit: string }[]; note: string; status: string; at: number }[];
  troubleshoot: {
    overdue: { id: number; customer: string; step: number; lateMin: number }[];
    waitingRider: { id: number; customer: string; waitMin: number }[];
    supportPhone: string;
    serverTime: string;
  };
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const when = (v: string | number | null) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "-";

export function useMe() {
  const [data, setData] = useState<MeData | null>(null);
  const [error, setError] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/processing/me", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || "Could not load");
      setData(j);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }
  useEffect(() => {
    void load();
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, []);
  return { data, error, reload: load };
}

export function StaffCard({ data }: { data: MeData | null }) {
  const name = data?.me.name || "Processing staff";
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="m-2 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-500 p-3 text-white shadow-md">
      <div className="flex items-center gap-2.5">
        {data?.me.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.me.photo} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/60" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-[13px] font-black ring-2 ring-white/40">{initials}</div>
        )}
        <div className="min-w-0">
          <div className="truncate text-[14px] font-extrabold">{name}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">{data?.me.role === "SUPER_ADMIN" ? "Admin" : "Processing staff"}</div>
          {data && data.kyc.status !== "Approved" && <div className="mt-0.5 inline-block rounded bg-amber-400 px-1 text-[9px] font-bold text-slate-900">KYC {data.kyc.status}</div>}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-center">
        <div className="rounded-lg bg-white/15 py-1">
          <div className="text-[16px] font-black">{data?.stats.today ?? "-"}</div>
          <div className="text-[9px] font-semibold text-emerald-50">Packed today</div>
        </div>
        <div className="rounded-lg bg-white/15 py-1">
          <div className="text-[16px] font-black">{data ? rupees(data.stats.rewardToday) : "-"}</div>
          <div className="text-[9px] font-semibold text-emerald-50">Reward today</div>
        </div>
      </div>
    </div>
  );
}

export function MyPackingPanel({ data }: { data: MeData | null }) {
  if (!data) return <Loading />;
  const s = data.stats;
  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-3 text-white shadow-md">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-50">🏆 My reward · {rupees(s.reward)} per packed order</div>
        <div className="mt-0.5 flex items-end gap-3">
          <div className="text-[28px] font-black leading-none">{rupees(s.rewardTotal)}</div>
          <div className="pb-0.5 text-[12px] font-semibold text-amber-50">
            {s.total} successful orders packed · this week {rupees(s.rewardWeek)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {[
          ["Today", s.today, "📦"],
          ["This week", s.week, "📅"],
          ["Last 30 days", s.month, "🗓"],
          ["Avg. pack time", s.avgMinutes === null ? "-" : `${s.avgMinutes} min`, "⏱"],
        ].map(([k, v, i]) => (
          <div key={String(k)} className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {i} {k}
            </div>
            <div className="text-[18px] font-black text-slate-900">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {[
          ["Accepted", s.accepted],
          ["Prepared", s.prepared],
          ["Cross checked", s.crossChecked],
          ["Stickers", s.stickers],
          ["Cancelled after pack", s.cancelled],
        ].map(([k, v]) => (
          <span key={String(k)} className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-600 ring-1 ring-slate-200">
            {k}: <b className="text-slate-900">{v}</b>
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">Orders I packed</div>
        {data.packed.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-slate-400">No packed orders yet — finish “Final Pack” on an order to see it here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-1">Order</th>
                  <th className="px-1 py-1">Customer</th>
                  <th className="px-1 py-1 text-right">Items</th>
                  <th className="px-1 py-1">Packed at</th>
                  <th className="px-1 py-1">Status</th>
                  <th className="px-3 py-1 text-right">Reward</th>
                </tr>
              </thead>
              <tbody>
                {data.packed.map((o) => (
                  <tr key={o.id} className="border-t border-slate-50">
                    <td className="px-3 py-1.5 font-bold">#{o.id}</td>
                    <td className="px-1 py-1.5">{o.customer}</td>
                    <td className="px-1 py-1.5 text-right tabular-nums">{o.items}</td>
                    <td className="px-1 py-1.5 text-slate-500">{when(o.at)}</td>
                    <td className="px-1 py-1.5">
                      <span className={`rounded px-1.5 text-[10px] font-bold ${o.status === "Cancelled" ? "bg-rose-50 text-rose-600" : o.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{o.status}</span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-bold text-emerald-700">{o.reward ? `+${rupees(o.reward)}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function SuppliesPanel({ data, reload }: { data: MeData | null; reload: () => Promise<void> }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [need, setNeed] = useState<Record<string, string>>({});
  const [left, setLeft] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const supplies = useMemo(() => data?.supplies || [], [data]);
  useEffect(() => {
    // pre-tick low items with a suggested quantity
    const c: Record<string, boolean> = {};
    const n: Record<string, string> = {};
    for (const s of supplies) {
      const suggest = Math.max(0, s.min * 2 - s.balance);
      if (s.balance < s.min) c[s.key] = true;
      n[s.key] = suggest ? String(suggest) : "";
    }
    setChecked((cur) => (Object.keys(cur).length ? cur : c));
    setNeed((cur) => (Object.keys(cur).length ? cur : n));
  }, [supplies]);

  if (!data) return <Loading />;

  async function post(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/processing/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Failed");
      setMsg({ ok: true, text: ok });
      await reload();
      return true;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const selected = supplies.filter((s) => checked[s.key] && Number(need[s.key]) > 0);
  const low = supplies.filter((s) => s.balance < s.min).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-[14px] font-extrabold text-slate-900">🧰 Packing material & stickers</h2>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">{low} low</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[520px] text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
              <th className="w-8 px-3 py-1.5" />
              <th className="px-1 py-1.5">Item</th>
              <th className="px-1 py-1.5 text-right">Balance (left)</th>
              <th className="px-1 py-1.5 text-right">Minimum</th>
              <th className="px-1 py-1.5">Status</th>
              <th className="px-3 py-1.5 text-right">Required</th>
            </tr>
          </thead>
          <tbody>
            {supplies.map((s) => {
              const isLow = s.balance < s.min;
              return (
                <tr key={s.key} className={`border-t border-slate-50 ${checked[s.key] ? "bg-emerald-50/40" : ""}`}>
                  <td className="px-3 py-1.5">
                    <input type="checkbox" checked={!!checked[s.key]} onChange={(e) => setChecked({ ...checked, [s.key]: e.target.checked })} className="h-4 w-4 accent-emerald-600" aria-label={`Request ${s.name}`} />
                  </td>
                  <td className="px-1 py-1.5 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-1 py-1.5 text-right">
                    <span className="inline-flex items-center gap-1">
                      <input
                        value={left[s.key] ?? String(s.balance)}
                        onChange={(e) => setLeft({ ...left, [s.key]: e.target.value.replace(/\D/g, "") })}
                        onBlur={() => {
                          const v = left[s.key];
                          if (v !== undefined && Number(v) !== s.balance) void post({ action: "balance", key: s.key, balance: Number(v) }, `${s.name}: balance updated`);
                        }}
                        inputMode="numeric"
                        className="w-16 rounded border border-slate-200 px-1.5 py-0.5 text-right"
                        aria-label={`${s.name} balance`}
                      />
                      <span className="text-[10px] text-slate-400">{s.unit}</span>
                    </span>
                  </td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-slate-500">
                    {s.min} {s.unit}
                  </td>
                  <td className="px-1 py-1.5">
                    <span className={`rounded px-1.5 text-[10px] font-bold ${isLow ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{isLow ? "Low" : "OK"}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <input
                      value={need[s.key] || ""}
                      onChange={(e) => {
                        setNeed({ ...need, [s.key]: e.target.value.replace(/\D/g, "") });
                        if (e.target.value) setChecked({ ...checked, [s.key]: true });
                      }}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-right font-bold"
                      aria-label={`${s.name} required`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for admin (optional)" className="min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[12px]" />
        <button
          disabled={busy || !selected.length}
          onClick={() =>
            void post({ action: "request", items: selected.map((s) => ({ key: s.key, qty: Number(need[s.key]) })), note }, "Request sent to admin ✓").then((ok) => {
              if (ok) {
                setChecked({});
                setNote("");
              }
            })
          }
          className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-extrabold text-white disabled:opacity-40"
        >
          Send request to admin ({selected.length})
        </button>
      </div>
      {msg && <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">My requests</div>
        {data.requests.length === 0 ? (
          <p className="py-5 text-center text-[12px] text-slate-400">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-[12px]">
            {data.requests.map((r) => (
              <li key={r.id} className="px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{when(r.at)}</span>
                  <span className={`rounded px-1.5 text-[10px] font-bold ${r.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : r.status === "Rejected" ? "bg-slate-100 text-slate-500" : r.status === "Approved" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{r.status}</span>
                </div>
                <div className="text-slate-700">{r.items.map((i) => `${i.name} × ${i.qty} ${i.unit}`).join(" · ")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function HelpPanel({ data, onOpenOrder }: { data: MeData | null; onOpenOrder: () => void }) {
  if (!data) return <Loading />;
  const t = data.troubleshoot;
  const STEP = ["Accept", "Prepare", "Cross check", "Sticker", "Final pack", "Invoice + Rider"];
  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-rose-200 bg-white">
          <div className="border-b border-rose-100 px-3 py-2 text-[13px] font-extrabold text-rose-700">⏰ Late orders ({t.overdue.length})</div>
          {t.overdue.length ? (
            <ul className="divide-y divide-slate-100 text-[12px]">
              {t.overdue.map((o) => (
                <li key={o.id} className="flex items-center justify-between px-3 py-1.5">
                  <span>
                    <b>#{o.id}</b> {o.customer} · next: <b>{STEP[o.step] || "-"}</b>
                  </span>
                  <span className="font-bold text-rose-600">{o.lateMin} min late</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-[12px] text-emerald-700">✓ No late orders</p>
          )}
        </div>
        <div className="rounded-xl border border-amber-200 bg-white">
          <div className="border-b border-amber-100 px-3 py-2 text-[13px] font-extrabold text-amber-700">🛵 Ready, waiting for rider ({t.waitingRider.length})</div>
          {t.waitingRider.length ? (
            <ul className="divide-y divide-slate-100 text-[12px]">
              {t.waitingRider.map((o) => (
                <li key={o.id} className="flex items-center justify-between px-3 py-1.5">
                  <span>
                    <b>#{o.id}</b> {o.customer}
                  </span>
                  <span className="font-bold text-amber-700">{o.waitMin} min</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-[12px] text-emerald-700">✓ No orders waiting</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-[12px]">
        <div className="mb-1.5 text-[13px] font-extrabold">🛠 Troubleshooting</div>
        <ul className="space-y-1.5 text-slate-700">
          {[
            ["A step button is grey", "Steps go in order: Accept → Prepare → Cross check → Sticker → Final pack → Invoice + Rider. Finish the earlier step first."],
            ["“Tick all items” message", "Open the order and tick every item after checking weight and quality."],
            ["Invoice + Rider does not work", "Choose a rider in the list first. If no rider shows, ask admin to approve a rider or put one online."],
            ["Order shows late", "Finish the next step now; if an item is out of stock, call admin before packing."],
            ["“Session expired”", "Log in again from the processing login page."],
            ["Stickers / bags running low", "Open Supplies, tick the items, enter the quantity and send the request."],
          ].map(([q, a]) => (
            <li key={q}>
              <b className="text-slate-900">{q}:</b> {a}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={`tel:${t.supportPhone}`} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white">
            📞 Call admin {t.supportPhone}
          </a>
          <a href={`https://wa.me/91${String(t.supportPhone).replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] font-bold text-white">
            WhatsApp admin
          </a>
          <button onClick={onOpenOrder} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-700">
            ← Back to orders
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Logged in as {data.me.name} ({data.me.mobile}) · server time {when(t.serverTime)}
        </p>
      </div>
    </div>
  );
}

export function ProfilePanel({ data, reload }: { data: MeData | null; reload: () => Promise<void> }) {
  if (!data) return <Loading />;
  async function post(body: Record<string, unknown>) {
    const r = await fetch("/api/processing/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!j.success) throw new Error(j.error || "Failed");
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        {data.me.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.me.photo} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-200" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-800">{data.me.name.slice(0, 1)}</div>
        )}
        <div className="min-w-0 text-[12px]">
          <div className="text-[15px] font-extrabold text-slate-900">{data.me.name}</div>
          <div className="text-slate-500">
            {data.me.mobile} · Staff ID #{data.me.id} · joined {when(data.me.since)}
          </div>
        </div>
      </div>
      <KycForm
        kind="staff"
        kyc={data.kyc}
        missing={data.kyc.missing}
        onSave={async (fields) => {
          await post({ action: "kyc", data: fields });
          await reload();
        }}
        onSubmit={async () => {
          await post({ action: "submitKyc" });
          await reload();
        }}
      />
    </div>
  );
}

export function WalletPanel({ data }: { data: MeData | null }) {
  if (!data) return <Loading />;
  const w = data.wallet;
  if (!w) return <p className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-[12px] text-slate-500">Wallet could not be loaded.</p>;
  const m = w.months[0];
  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-4 text-white shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">This month balance · {m?.label}</div>
        <div className="text-[30px] font-black leading-tight">{rupees(m?.balance || 0)}</div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10px]">
          {[
            ["Salary", m?.salary || 0],
            ["Incentive", m?.incentive || 0],
            ["Advance", m?.advance || 0],
            ["Paid", m?.paid || 0],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg bg-white/15 px-1 py-1.5">
              <div className="text-[13px] font-extrabold">{rupees(Number(v))}</div>
              <div className="text-emerald-50">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-emerald-50">
          Incentive: {rupees(w.reward)} × {m?.orders || 0} packed orders this month
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">📅 Monthly payout</div>
        <table className="w-full text-[11px] sm:text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-1">Month</th>
              <th className="px-1 py-1 text-right">Orders</th>
              <th className="px-1 py-1 text-right">Salary</th>
              <th className="px-1 py-1 text-right">Incentive</th>
              <th className="px-1 py-1 text-right">Advance</th>
              <th className="px-1 py-1 text-right">Paid</th>
              <th className="px-3 py-1 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {w.months.map((r, i) => (
              <tr key={r.from} className="border-t border-slate-50">
                <td className={`px-3 py-1.5 ${i === 0 ? "font-bold text-emerald-700" : "text-slate-600"}`}>{r.label}</td>
                <td className="px-1 py-1.5 text-right">{r.orders}</td>
                <td className="px-1 py-1.5 text-right">{rupees(r.salary)}</td>
                <td className="px-1 py-1.5 text-right text-emerald-700">+{rupees(r.incentive)}</td>
                <td className="px-1 py-1.5 text-right text-amber-700">{r.advance ? `− ${rupees(r.advance)}` : "-"}</td>
                <td className="px-1 py-1.5 text-right text-blue-700">{r.paid ? `− ${rupees(r.paid)}` : "-"}</td>
                <td className={`px-3 py-1.5 text-right font-extrabold ${r.balance < 0 ? "text-rose-600" : "text-emerald-700"}`}>{rupees(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-1.5 text-[10px] text-slate-400">Balance = Salary + Incentive − Advance − Paid</p>
      </div>
      {w.ledger.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-3 py-2 text-[13px] font-extrabold">Advance & payments</div>
          <ul className="divide-y divide-slate-100 text-[12px]">
            {w.ledger.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-3 py-1.5">
                <span className="text-slate-600">
                  {when(e.at)}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 text-[10px] font-bold ${e.type === "Paid" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{e.type}</span>
                  <b>{rupees(e.amount)}</b>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return <div className="h-40 animate-pulse rounded-xl bg-slate-200/60" />;
}
