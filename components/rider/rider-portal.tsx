"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import KycForm, { type Kyc } from "@/components/kyc-form";

/*
 * Fresh2Cook — Rider Portal
 * Compact, mobile-first rider app with sidebar (desktop) and bottom tabs (phone).
 * Data: /api/rider-portal (only the logged-in rider's own orders).
 */

type Item = { name: string; pack: string | null; qty: number };

type Task = {
  assignmentId: number;
  orderId: number;
  status: string;
  assignedAt: string;
  acceptedAt: string | null;
  pickedAt: string | null;
  deliveredAt: string | null;
  deliveryDeadline: string | null;
  earning: number;
  customer: string;
  phone: string | null;
  address: string | null;
  amount: number;
  orderStatus: string | null;
  latitude: number | null;
  longitude: number | null;
  items: Item[];
};

type PortalData = {
  generatedAt: string;
  rider: {
    id: number;
    name: string;
    mobile: string;
    vehicle: string;
    status: string;
    approvalStatus: string;
    rating: number;
    completedDeliveries: number;
    totalEarnings: number;
    address: string | null;
    photo: string | null;
    zone: string | null;
    lastSeen: string | null;
    joinedAt: string;
    documents: { aadhaar: boolean; license: boolean; rc: boolean; photo: boolean };
  };
  stats: {
    toAccept: number;
    inProgress: number;
    deliveredToday: number;
    earningsToday: number;
    deliveredWeek: number;
    earningsWeek: number;
    deliveredMonth: number;
    earningsMonth: number;
    onTimeRate: number | null;
    rejected: number;
  };
  days: { date: string; label: string; deliveries: number; earnings: number }[];
  active: Task[];
  history: Task[];
  wallet: Wallet | null;
  kyc: (Kyc & { missing: string[] }) | null;
};

type Wallet = {
  upi: string;
  earned: number;
  advanceTotal: number;
  paidTotal: number;
  pending: number;
  balance: number;
  weeks: { from: string; label: string; deliveries: number; earnings: number; advance: number; paid: number; balance: number }[];
  advances: { id: number; amount: number; note: string | null; at: string }[];
  payouts: { id: number; amount: number; status: string; requestedAt: string; paidAt: string | null }[];
};

type Tab = "tasks" | "history" | "earnings" | "wallet" | "profile";

const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const time = (v: string | null) =>
  v ? new Date(v).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "-";
const dateTime = (v: string | null) =>
  v
    ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })
    : "-";

const STATUS: Record<string, { label: string; cls: string; step: number }> = {
  "Pending Acceptance": { label: "New · accept", cls: "bg-amber-50 text-amber-700 ring-amber-200", step: 0 },
  Accepted: { label: "Go to pickup", cls: "bg-blue-50 text-blue-700 ring-blue-200", step: 1 },
  "Picked Up": { label: "Picked up", cls: "bg-violet-50 text-violet-700 ring-violet-200", step: 2 },
  "Otp Sent": { label: "On the way", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200", step: 3 },
  "Out For Delivery": { label: "On the way", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200", step: 3 },
  Delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", step: 4 },
  Rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700 ring-rose-200", step: 0 },
  Cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-600 ring-slate-200", step: 0 },
};

const STEPS = ["Accept", "Pickup", "On the way", "Delivered"];

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: "tasks", label: "My Tasks", icon: "📦" },
  { key: "wallet", label: "Earnings & Wallet", icon: "👛" },
  { key: "profile", label: "Profile", icon: "👤" },
];

function mapsUrl(t: Task) {
  if (t.latitude && t.longitude) return `https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}`;
  if (t.address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(t.address)}`;
  return null;
}

function Pill({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${s.cls}`}>
      {s.label}
    </span>
  );
}

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        {right}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

/** Opens the phone dialer. The customer's number is fetched only at the moment of the call and never shown in the app. */
async function callCustomer(assignmentId: number) {
  try {
    const r = await fetch("/api/rider-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "callCustomer", assignmentId }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.tel) throw new Error(j.error || "Could not start the call");
    window.location.href = "tel:" + j.tel;
  } catch (e) {
    window.alert(e instanceof Error ? e.message : "Could not start the call");
  }
}

function TaskCard({
  task,
  busy,
  onAction,
}: {
  task: Task;
  busy: boolean;
  onAction: (action: string, task: Task, otp?: string) => Promise<boolean>;
}) {
  const [showItems, setShowItems] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);
  const step =STATUS[task.status]?.step ?? 0;
  const map = mapsUrl(task);
  const itemCount = task.items.reduce((s, i) => s + Number(i.qty || 0), 0);
  const itemSummary = task.items.map((i) => `${i.name}${i.pack ? ` ${i.pack}` : ""} ×${i.qty}`).join(", ");
  const late = task.deliveryDeadline && new Date(task.deliveryDeadline) < new Date();

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Row 1: order, status, amount */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[15px] font-bold text-slate-900">#{task.orderId}</span>
            <Pill status={task.status} />
            {late && <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">LATE</span>}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            Assigned {time(task.assignedAt)} · Earn <b className="font-semibold text-emerald-700">{rupees(task.earning || 25)}</b>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-bold tabular-nums text-slate-900">{rupees(task.amount)}</div>
          <div className="text-[10px] text-slate-500">order value</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2.5 flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <div className={`h-1 rounded-full ${i < step ? "bg-emerald-500" : i === step ? "bg-emerald-300" : "bg-slate-200"}`} />
            <span className={`text-[9px] ${i <= step ? "font-semibold text-slate-700" : "text-slate-400"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Customer + address */}
      <div className="mt-2.5 space-y-1.5 rounded-lg bg-slate-50 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-slate-900">{task.customer}</div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {["Accepted", "Picked Up", "Otp Sent", "Out For Delivery"].includes(task.status) && (
              <button
                type="button"
                onClick={() => void callCustomer(task.assignmentId)}
                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm"
                aria-label={`Call ${task.customer}`}
              >
                📞 Call
              </button>
            )}
            {map && (
              <a href={map} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-700">
                🧭 Map
              </a>
            )}
          </div>
        </div>
        {task.address && <div className="text-[12px] leading-snug text-slate-700">📍 {task.address}</div>}
        {task.items.length > 0 && (
          <button type="button" onClick={() => setShowItems((v) => !v)} className="block w-full text-left text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">{itemCount} items:</span>{" "}
            <span className={showItems ? "" : "line-clamp-1"}>{itemSummary}</span>
          </button>
        )}
      </div>

      {/* Action */}
      <div className="mt-2.5">
        {task.status === "Pending Acceptance" && (
          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={busy}
              onClick={() => void onAction("reject", task)}
              className="rounded-lg border border-slate-300 bg-white py-2.5 text-[13px] font-semibold text-slate-700 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              disabled={busy}
              onClick={() => void onAction("accept", task)}
              className="col-span-2 rounded-lg bg-emerald-600 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50"
            >
              {busy ? "Saving…" : "Accept order"}
            </button>
          </div>
        )}
        {task.status === "Accepted" && (
          <button
            disabled={busy}
            onClick={() => void onAction("pickup", task)}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50"
          >
            {busy ? "Saving…" : "I have picked up the order"}
          </button>
        )}
        {task.status === "Picked Up" && (
          <button
            disabled={busy}
            onClick={() => void onAction("startDelivery", task)}
            className="w-full rounded-lg bg-violet-600 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50"
          >
            {busy ? "Saving…" : "Start delivery"}
          </button>
        )}
        {(task.status === "Otp Sent" || task.status === "Out For Delivery") && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await onAction("complete", task, otp)) setOtp("");
            }}
            className="flex gap-2"
          >
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="Customer OTP"
              aria-label={`OTP for order ${task.orderId}`}
              className="w-full min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-center text-[15px] font-bold tracking-[0.3em] text-slate-900 placeholder:text-[12px] placeholder:font-normal placeholder:tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              disabled={busy || otp.length < 4}
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50"
            >
              {busy ? "…" : "Delivered"}
            </button>
          </form>
        )}
        {(task.status === "Otp Sent" || task.status === "Out For Delivery") && (
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500">Customer didn't get the OTP? They can see it on the Track Order page.</span>
            <button
              type="button"
              disabled={busy || cooldown > 0}
              onClick={async () => {
                if (!window.confirm("Send a new OTP? The old OTP will stop working.")) return;
                if (await onAction("resendOtp", task)) {
                  setOtp("");
                  setCooldown(30);
                }
              }}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "↻ Resend OTP"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function RiderPortal({ loginPath = "/rider/login" }: { loginPath?: string }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [tab, setTab] = useState<Tab>("tasks");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [upiInput, setUpiInput] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rider-portal", { cache: "no-store" });
      const json = await res.json();
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok || !json.success) throw new Error(json.error || "Could not load");
      setData(json);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function post(payload: Record<string, unknown>) {
    const res = await fetch("/api/rider-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) setNeedsLogin(true);
    if (!res.ok || !json.success) throw new Error(json.error || "Action failed");
    return json;
  }

  async function onAction(action: string, task: Task, otp?: string) {
    if (action === "reject" && !window.confirm(`Reject order #${task.orderId}?`)) return false;
    setBusyId(task.assignmentId);
    try {
      const json = await post({ action, assignmentId: task.assignmentId, otp });
      setToast({ ok: true, text: json.message || "Done" });
      await load();
      return true;
    } catch (err) {
      setToast({ ok: false, text: err instanceof Error ? err.message : "Action failed" });
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function toggleOnline() {
    if (!data) return;
    const goOnline = data.rider.status === "Offline";
    try {
      const json = await post({ action: "toggleOnline", online: goOnline });
      setToast({ ok: true, text: json.message });
      await load();
    } catch (err) {
      setToast({ ok: false, text: err instanceof Error ? err.message : "Could not change status" });
    }
  }

  async function walletAction(payload: Record<string, unknown>) {
    setWalletBusy(true);
    try {
      const json = await post(payload);
      setToast({ ok: true, text: json.message || "Saved" });
      setUpiInput(null);
      await load();
    } catch (err) {
      setToast({ ok: false, text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setWalletBusy(false);
    }
  }

  async function logout() {
    try {
      await post({ action: "logout" });
    } catch {
      /* ignore */
    }
    window.location.href = loginPath;
  }

  // Full-screen shell so the shop header / WhatsApp button don't show on rider pages.
  const shell = (content: ReactNode) => (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-50 text-slate-900">{content}</div>
  );

  if (needsLogin) {
    return shell(
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl">🛵</div>
          <h1 className="mt-2 text-base font-bold">Rider login required</h1>
          <p className="mt-1 text-[12px] text-slate-500">Your session has expired. Please log in again to see your orders.</p>
          <a href={loginPath} className="mt-4 block rounded-lg bg-emerald-600 py-2.5 text-[13px] font-bold text-white">
            Go to rider login
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return shell(
      <div className="space-y-2 p-3">
        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
            {error}
            <button onClick={() => void load()} className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="h-14 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200/70" />
              ))}
            </div>
            <div className="h-56 animate-pulse rounded-xl bg-slate-200/70" />
          </>
        )}
      </div>
    );
  }

  const { rider, stats, days, active, history } = data;
  const online = rider.status !== "Offline";
  const maxDay = Math.max(1, ...days.map((d) => d.earnings));
  const initials = rider.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const photo = data.kyc?.photo || rider.photo || "";

  const statTiles = [
    { label: "To accept", value: stats.toAccept, cls: stats.toAccept ? "text-amber-600" : "text-slate-900", icon: "🔔", bg: "from-amber-50" },
    { label: "In progress", value: stats.inProgress, cls: "text-blue-700", icon: "🛵", bg: "from-blue-50" },
    { label: "Done today", value: stats.deliveredToday, cls: "text-violet-700", icon: "✅", bg: "from-violet-50" },
    { label: "Earned today", value: rupees(stats.earningsToday), cls: "text-emerald-700", icon: "₹", bg: "from-emerald-50" },
  ];

  const tabCount: Partial<Record<Tab, number>> = { tasks: active.length };

  return shell(
    <div className="flex min-h-full">
      {/* ===== Sidebar (tablet / desktop) ===== */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="text-[15px] font-extrabold text-emerald-700">Fresh2Cook</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Rider app</div>
        </div>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
          <Avatar photo={photo} initials={initials} className="h-10 w-10 bg-emerald-100 text-emerald-800" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold">{rider.name}</div>
            <div className="text-[11px] text-slate-500">ID #{rider.id} · {rider.vehicle}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium ${
                tab === n.key ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-4 text-center">{n.icon}</span>
                {n.label}
              </span>
              {tabCount[n.key] ? (
                <span className="rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">{tabCount[n.key]}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-2">
          <button onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50">
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="min-w-0 flex-1 pb-20 md:pb-6">
        {/* Top bar: who is logged in + online switch */}
        <header className="sticky top-0 z-10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-3 py-2.5 text-white shadow-md md:px-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar photo={photo} initials={initials} className="h-10 w-10 shrink-0 bg-white/20 text-white ring-2 ring-white/50" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold leading-tight">
                  <span className="md:hidden">{rider.name}</span>
                  <span className="hidden md:inline">{NAV.find((n) => n.key === tab)?.label}</span>
                </div>
                <div className="truncate text-[11px] text-emerald-50">
                  ID #{rider.id} · {rider.mobile} · ⭐ {Number(rider.rating || 0).toFixed(1)}
                  {rider.zone ? ` · ${rider.zone}` : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => void toggleOnline()}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                online ? "border-white/60 bg-white text-emerald-700" : "border-white/40 bg-white/10 text-white"
              }`}
              aria-label="Change online status"
            >
              <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} />
              {online ? (rider.status === "Busy" ? "Busy" : "Online") : "Offline"}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl space-y-3 p-3 md:p-5">
          {rider.approvalStatus !== "Approved" && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <span>
                Your account is <b>{rider.approvalStatus}</b>. Complete your KYC (documents, address with GPS, reference) to get approved.
              </span>
              <button onClick={() => setTab("profile")} className="rounded-md bg-amber-600 px-2 py-1 text-[11px] font-bold text-white">
                Complete KYC →
              </button>
            </div>
          )}

          {/* Today stats */}
          <div className="grid grid-cols-4 gap-2">
            {statTiles.map((s) => (
              <div key={s.label} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${s.bg} to-white px-2 py-2 text-center shadow-sm md:px-3 md:text-left`}>
                <div className="text-[13px] leading-none">{s.icon}</div>
                <div className={`mt-0.5 text-[16px] font-black leading-tight tabular-nums md:text-xl ${s.cls}`}>{s.value}</div>
                <div className="text-[10px] font-semibold text-slate-500 md:text-[11px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ===== TASKS ===== */}
          {tab === "tasks" && (
            <>
              {active.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                  <div className="text-2xl">🛵</div>
                  <div className="mt-1 text-[13px] font-semibold">No active orders</div>
                  <div className="text-[12px] text-slate-500">
                    {online ? "Stay online — new orders will appear here automatically." : "You are offline. Go online to get orders."}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                  {active.map((t) => (
                    <TaskCard key={t.assignmentId} task={t} busy={busyId === t.assignmentId} onAction={onAction} />
                  ))}
                </div>
              )}
              {history.length > 0 && (
                <Panel title="Order history" right={<span className="text-[11px] text-slate-500">last {history.length}</span>}>
                  <HistoryList list={history} />
                </Panel>
              )}
            </>
          )}

          {/* ===== HISTORY ===== */}
          {tab === "history" && (
            <Panel title="Order history" right={<span className="text-[11px] text-slate-500">last {history.length}</span>}>
              {history.length ? <HistoryList list={history} /> : <p className="py-6 text-center text-[12px] text-slate-400">No past orders yet.</p>}
            </Panel>
          )}

          {/* ===== EARNINGS ===== */}
          {tab === "wallet" && (
            <>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {[
                  { label: "Today", value: stats.earningsToday, sub: `${stats.deliveredToday} deliveries` },
                  { label: "Last 7 days", value: stats.earningsWeek, sub: `${stats.deliveredWeek} deliveries` },
                  { label: "Last 30 days", value: stats.earningsMonth, sub: `${stats.deliveredMonth} deliveries` },
                  { label: "All time", value: rider.totalEarnings, sub: `${rider.completedDeliveries} deliveries` },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{c.label}</div>
                    <div className="text-lg font-bold tabular-nums text-emerald-700">{rupees(c.value)}</div>
                    <div className="text-[11px] text-slate-500">{c.sub}</div>
                  </div>
                ))}
              </div>
              <Panel title="Day by day · last 7 days">
                <ul className="space-y-1.5">
                  {days.map((d) => (
                    <li key={d.date} className="flex items-center gap-2 text-[12px]">
                      <span className={`w-16 shrink-0 ${d.label === "Today" ? "font-semibold text-emerald-700" : "text-slate-600"}`}>{d.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d.earnings / maxDay) * 100}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right text-slate-500">{d.deliveries}×</span>
                      <span className="w-14 shrink-0 text-right font-semibold tabular-nums">{rupees(d.earnings)}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}

          {/* ===== WALLET ===== */}
          {tab === "wallet" && (
            <>
              {!data.wallet ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-[12px] text-slate-500">Wallet could not be loaded.</p>
              ) : (
                <>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-4 text-white shadow-md">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">Balance to be paid</div>
                    <div className="text-[30px] font-black leading-tight tabular-nums">{rupees(data.wallet.balance)}</div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      {[
                        ["Earned", data.wallet.earned],
                        ["Advance", data.wallet.advanceTotal],
                        ["Paid", data.wallet.paidTotal],
                        ["Requested", data.wallet.pending],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="rounded-lg bg-white/15 px-1 py-1.5">
                          <div className="text-[13px] font-extrabold tabular-nums">{rupees(Number(v))}</div>
                          <div className="text-emerald-50">{k}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => void walletAction({ action: "requestPayout" })}
                      disabled={walletBusy || data.wallet.balance - data.wallet.pending <= 0}
                      className="mt-3 w-full rounded-xl bg-white py-2 text-[13px] font-extrabold text-emerald-700 disabled:opacity-50"
                    >
                      Request payout {rupees(Math.max(0, data.wallet.balance - data.wallet.pending))}
                    </button>
                  </div>

                  <Panel title="💳 My UPI ID">
                    {upiInput === null ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className={`truncate text-[15px] font-bold ${data.wallet.upi ? "text-slate-900" : "text-slate-400"}`}>{data.wallet.upi || "Not added yet"}</div>
                          <div className="text-[11px] text-slate-500">Weekly payouts are sent to this UPI ID</div>
                        </div>
                        <button onClick={() => setUpiInput(data.wallet!.upi)} className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700">
                          {data.wallet.upi ? "Change" : "+ Add"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={upiInput}
                          onChange={(e) => setUpiInput(e.target.value.trim())}
                          placeholder="yourname@okaxis"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-2 text-[13px] focus:border-emerald-500 focus:outline-none"
                        />
                        <button onClick={() => void walletAction({ action: "setUpi", upi: upiInput })} disabled={walletBusy} className="rounded-lg bg-emerald-600 px-3 text-[12px] font-bold text-white">
                          Save
                        </button>
                        <button onClick={() => setUpiInput(null)} className="rounded-lg border border-slate-200 px-2 text-[12px] font-semibold text-slate-600">
                          ✕
                        </button>
                      </div>
                    )}
                  </Panel>

                  <Panel title="📅 Weekly payout" right={<span className="text-[11px] text-slate-500">Mon – Sun</span>}>
                    <div className="-mx-1 overflow-x-auto">
                      <table className="w-full text-[11px] sm:text-[12px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-400">
                            <th className="px-1 py-1">Week</th>
                            <th className="px-1 py-1 text-right">Orders</th>
                            <th className="px-1 py-1 text-right">Earnings</th>
                            <th className="px-1 py-1 text-right">Advance</th>
                            <th className="px-1 py-1 text-right">Paid</th>
                            <th className="px-1 py-1 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.wallet.weeks.map((w) => (
                            <tr key={w.from} className="border-b border-slate-50">
                              <td className={`px-1 py-1.5 ${w.label === "This week" ? "font-bold text-emerald-700" : "text-slate-600"}`}>{w.label}</td>
                              <td className="px-1 py-1.5 text-right tabular-nums">{w.deliveries}</td>
                              <td className="px-1 py-1.5 text-right font-semibold tabular-nums">{rupees(w.earnings)}</td>
                              <td className="px-1 py-1.5 text-right tabular-nums text-amber-700">{w.advance ? `− ${rupees(w.advance)}` : "-"}</td>
                              <td className="px-1 py-1.5 text-right tabular-nums text-blue-700">{w.paid ? `− ${rupees(w.paid)}` : "-"}</td>
                              <td className={`px-1 py-1.5 text-right font-extrabold tabular-nums ${w.balance < 0 ? "text-rose-600" : "text-emerald-700"}`}>{rupees(w.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400">Balance = Earnings − Advance − Paid</p>
                  </Panel>

                  {(data.wallet.advances.length > 0 || data.wallet.payouts.length > 0) && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Panel title="Advance taken">
                        {data.wallet.advances.length ? (
                          <ul className="divide-y divide-slate-100 text-[12px]">
                            {data.wallet.advances.map((a) => (
                              <li key={a.id} className="flex justify-between py-1.5">
                                <span className="text-slate-600">
                                  {dateTime(a.at)}
                                  {a.note ? ` · ${a.note}` : ""}
                                </span>
                                <b className="text-amber-700">{rupees(a.amount)}</b>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="py-3 text-center text-[12px] text-slate-400">No advance taken</p>
                        )}
                      </Panel>
                      <Panel title="Payouts">
                        {data.wallet.payouts.length ? (
                          <ul className="divide-y divide-slate-100 text-[12px]">
                            {data.wallet.payouts.map((p) => (
                              <li key={p.id} className="flex items-center justify-between py-1.5">
                                <span className="text-slate-600">{dateTime(p.paidAt || p.requestedAt)}</span>
                                <span className="flex items-center gap-1.5">
                                  <span className={`rounded px-1.5 text-[10px] font-bold ${p.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status}</span>
                                  <b>{rupees(p.amount)}</b>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="py-3 text-center text-[12px] text-slate-400">No payouts yet</p>
                        )}
                      </Panel>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ===== PROFILE ===== */}
          {tab === "profile" && data.kyc && (
            <KycForm
              kind="rider"
              kyc={data.kyc}
              missing={data.kyc.missing}
              onSave={async (fields) => {
                await post({ action: "kyc", data: fields });
                await load();
              }}
              onSubmit={async () => {
                const j = await post({ action: "submitKyc" });
                setToast({ ok: true, text: j.message || "Sent" });
                await load();
              }}
            />
          )}
          {tab === "profile" && (
            <div className="grid gap-3 md:grid-cols-2">
              <Panel title="My details">
                <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-[12px]">
                  {[
                    ["Name", rider.name],
                    ["Rider ID", `#${rider.id}`],
                    ["Mobile", rider.mobile],
                    ["Vehicle", rider.vehicle],
                    ["Zone", rider.zone || "-"],
                    ["Address", rider.address || "-"],
                    ["Account", rider.approvalStatus],
                    ["Joined", dateTime(rider.joinedAt)],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-medium text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
              <div className="space-y-3">
                <Panel title="Performance">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">⭐ {Number(rider.rating || 0).toFixed(1)}</div>
                      <div className="text-[10px] text-slate-500">Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{rider.completedDeliveries}</div>
                      <div className="text-[10px] text-slate-500">Delivered</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{stats.onTimeRate === null ? "-" : `${stats.onTimeRate}%`}</div>
                      <div className="text-[10px] text-slate-500">On time</div>
                    </div>
                  </div>
                </Panel>
                <button onClick={() => void logout()} className="w-full rounded-lg border border-rose-200 bg-white py-2.5 text-[13px] font-semibold text-rose-600 md:hidden">
                  Logout
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400">Auto-refresh every 20 sec · last {time(data.generatedAt)}</p>
        </div>
      </main>

      {/* ===== Bottom tabs (phone) ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${tab === n.key ? "text-emerald-700" : "text-slate-500"}`}
          >
            <span className="text-[16px] leading-none">{n.icon}</span>
            {n.label}
            {tabCount[n.key] ? (
              <span className="absolute right-[22%] top-1 rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-4 text-white">{tabCount[n.key]}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-3 bottom-20 z-30 mx-auto max-w-sm rounded-lg px-3 py-2 text-center text-[12px] font-semibold text-white shadow-lg md:bottom-6 ${
            toast.ok ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function HistoryList({ list }: { list: Task[] }) {
  return (
    <ul className="-my-1 divide-y divide-slate-100">
      {list.map((t) => (
        <li key={t.assignmentId} className="flex items-center gap-2 py-2">
          <span className="w-10 shrink-0 text-[12px] font-semibold text-slate-500">#{t.orderId}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{t.customer}</div>
            <div className="truncate text-[11px] text-slate-500">
              {dateTime(t.deliveredAt || t.assignedAt)}
              {t.address ? ` · ${t.address}` : ""}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[12px] font-semibold tabular-nums">{t.status === "Delivered" ? `+${rupees(t.earning)}` : rupees(t.amount)}</div>
            <Pill status={t.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ photo, initials, className }: { photo: string; initials: string; className: string }) {
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt="" className={`rounded-full object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center rounded-full text-[12px] font-bold ${className}`}>{initials}</div>
  );
}
