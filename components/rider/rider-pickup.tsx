"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/*
 * Fresh2Cook — Rider Pickup page
 * Dropdown shows only the logged-in rider's orders that are ready for pickup
 * (status "Accepted"). Uses the secure /api/rider-portal endpoint.
 */

type Item = { name: string; pack: string | null; qty: number };
type Task = {
  assignmentId: number;
  orderId: number;
  status: string;
  assignedAt: string;
  customer: string;
  phone: string | null;
  address: string | null;
  amount: number;
  earning: number;
  latitude: number | null;
  longitude: number | null;
  items: Item[];
};

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const time = (v: string) =>
  new Date(v).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default function RiderPickup({
  loginPath = "/rider/login",
  tasksPath = "/rider/my-tasks",
}: {
  loginPath?: string;
  tasksPath?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [riderName, setRiderName] = useState("");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rider-portal", { cache: "no-store" });
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not load orders");
      setTasks(json.active || []);
      setRiderName(json.rider?.name || "");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Pre-select from ?assignmentId=.. if the link had one
    const fromUrl = new URLSearchParams(window.location.search).get("assignmentId");
    if (fromUrl) setSelected(fromUrl);
    void load();
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
  }, [load]);

  const ready = useMemo(() => tasks.filter((t) => t.status === "Accepted"), [tasks]);
  const waitingAccept = useMemo(() => tasks.filter((t) => t.status === "Pending Acceptance").length, [tasks]);

  // Auto-select when there is exactly one order ready
  useEffect(() => {
    if (!ready.length) return;
    if (!ready.some((t) => String(t.assignmentId) === selected)) {
      setSelected(ready.length === 1 ? String(ready[0].assignmentId) : "");
    }
  }, [ready, selected]);

  const task = ready.find((t) => String(t.assignmentId) === selected) || null;

  async function pickup() {
    if (!task) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rider-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pickup", assignmentId: task.assignmentId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) setNeedsLogin(true);
      if (!res.ok || !json.success) throw new Error(json.error || "Pickup failed");
      setMsg({ ok: true, text: `Order #${task.orderId} picked up. Head to the customer now.` });
      setSelected("");
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Pickup failed" });
    } finally {
      setBusy(false);
    }
  }

  const map = task
    ? task.latitude && task.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`
      : task.address
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}`
        : null
    : null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <a href={tasksPath} className="rounded-lg border border-slate-200 px-2 py-1 text-[12px] font-semibold text-slate-700" aria-label="Back to my tasks">
            ←
          </a>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold leading-tight">Pickup Order</h1>
            <p className="truncate text-[11px] text-slate-500">{riderName ? `${riderName} · ` : ""}pick up the order, then go to the customer</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-3 p-3">
        {needsLogin ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[13px] font-semibold">Your login session has expired</p>
            <a href={loginPath} className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-[13px] font-bold text-white">
              Rider login
            </a>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            <div className="h-11 animate-pulse rounded-lg bg-slate-200/70" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200/70" />
          </div>
        ) : (
          <>
            {/* Dropdown */}
            <label className="block">
              <span className="mb-1 flex items-center justify-between text-[12px] font-semibold text-slate-700">
                Choose order
                <span className="font-normal text-slate-500">{ready.length} ready for pickup</span>
              </span>
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setMsg(null);
                }}
                disabled={!ready.length || busy}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">{ready.length ? "— Select an order —" : "No orders ready for pickup"}</option>
                {ready.map((t) => (
                  <option key={t.assignmentId} value={String(t.assignmentId)}>
                    #{t.orderId} · {t.customer} · {rupees(t.amount)}
                    {t.address ? ` · ${t.address.slice(0, 28)}${t.address.length > 28 ? "…" : ""}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {!ready.length && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-[12px] text-slate-600">
                {waitingAccept > 0 ? (
                  <>
                    You have <b>{waitingAccept}</b> new order(s) to <b>Accept</b> first.
                    <a href={tasksPath} className="mt-2 block rounded-lg bg-emerald-600 py-2 text-[13px] font-bold text-white">
                      Go to My Tasks and accept
                    </a>
                  </>
                ) : (
                  "No accepted orders. New orders will appear here."
                )}
              </div>
            )}

            {/* Selected order details */}
            {task && (
              <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[15px] font-bold">#{task.orderId}</div>
                    <div className="text-[11px] text-slate-500">
                      Assignment #{task.assignmentId} · {time(task.assignedAt)} · Earn{" "}
                      <b className="text-emerald-700">{rupees(task.earning || 25)}</b>
                    </div>
                  </div>
                  <div className="text-right text-[15px] font-bold tabular-nums">{rupees(task.amount)}</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold">{task.customer}</div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {map && (
                        <a href={map} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-700">
                          🧭 Map
                        </a>
                      )}
                    </div>
                  </div>
                  {task.address && <div className="mt-1 text-[12px] text-slate-700">📍 {task.address}</div>}
                </div>

                {task.items.length > 0 && (
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Check items ({task.items.reduce((s, i) => s + Number(i.qty || 0), 0)})
                    </div>
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                      {task.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between px-2 py-1 text-[12px]">
                          <span>
                            {i.name} {i.pack && <span className="text-slate-500">{i.pack}</span>}
                          </span>
                          <span className="font-semibold">×{i.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {msg && (
              <div className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
                {msg.text}
                {msg.ok && (
                  <a href={tasksPath} className="ml-1 underline">
                    My Tasks →
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Primary action stays at the bottom, easy to reach with one hand */}
      {!needsLogin && !loading && (
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => void pickup()}
            disabled={!task || busy}
            className="mx-auto block w-full max-w-lg rounded-lg bg-blue-600 py-3 text-[14px] font-bold text-white shadow-sm disabled:opacity-40"
          >
            {busy ? "Saving…" : task ? `Pickup Order #${task.orderId}` : "Choose an order first"}
          </button>
        </div>
      )}
    </div>
  );
}
