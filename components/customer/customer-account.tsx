"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import OrderTrackCard, { rupees, whenIST, type CustomerOrder } from "@/components/customer/order-track-card";
import InviteShare from "@/components/customer/invite-share";

/*
 * Fresh2Cook — Customer "My Account" with sidebar.
 * Tabs: Overview · My Orders · Track Order · Wallet · Refer & Earn · Profile
 * Data: /api/customer-account (logged-in customer only).
 */

type Data = {
  profile: { name: string; mobile: string; email: string | null; referralCode: string; joinedAt: string };
  stats: { totalOrders: number; delivered: number; totalSpent: number; activeOrders: number };
  orders: CustomerOrder[];
  wallet: {
    balance: number;
    earned: number;
    soonExpiring: number;
    transactions: { id: number; amount: number; type: string; date: string; expiresAt: string }[];
  };
  referral: {
    code: string;
    reward: number;
    welcome: number;
    totalEarned: number;
    friends: { id: number; friend: string; status: string; earned: number; date: string }[];
  };
};

type Tab = "overview" | "orders" | "track" | "wallet" | "refer" | "profile";

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "🏠" },
  { key: "orders", label: "My Orders", icon: "📦" },
  { key: "track", label: "Track Order", icon: "🛵" },
  { key: "wallet", label: "Wallet", icon: "👛" },
  { key: "refer", label: "Refer & Earn", icon: "🎁" },
  { key: "profile", label: "Profile", icon: "👤" },
];

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        {right}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Tile({ label, value, sub, tone = "text-slate-900", onClick }: { label: string; value: string; sub?: string; tone?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[76px] flex-col justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-lg font-bold leading-none tabular-nums ${tone}`}>{value}</span>
      {sub ? <span className="truncate text-[10px] text-slate-500">{sub}</span> : <span />}
    </button>
  );
}

export default function CustomerAccount() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [tab, setTabState] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState<"All" | "Active" | "Delivered" | "Cancelled">("All");
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const setTab = (t: Tab) => {
    setTabState(t);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", t);
      window.history.replaceState(null, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      /* ignore */
    }
  };

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/customer-account", { cache: "no-store" });
      if (r.status === 401) {
        window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const j = await r.json();
      if (!j.success) throw new Error(j.error || "Could not load");
      setData(j);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }, []);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (t && NAV.some((n) => n.key === t)) setTabState(t);
    void load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function post(payload: Record<string, unknown>) {
    const r = await fetch("/api/customer-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.success) throw new Error(j.error || "Something went wrong");
    return j;
  }

  async function reorder(order: CustomerOrder) {
    setReorderingId(order.id);
    try {
      const j = await post({ action: "reorder", orderId: order.id });
      const add: { id: number; qty: number }[] = j.cart || [];
      if (!add.length) {
        setToast({ ok: false, text: "Products from this order are not available right now." });
        return;
      }
      let cart: { id: number; qty: number; stock?: number; pack?: string }[] = [];
      try {
        cart = JSON.parse(localStorage.getItem("freshcut-cart") || "[]");
        if (!Array.isArray(cart)) cart = [];
      } catch {
        cart = [];
      }
      for (const item of j.cart) {
        const existing = cart.find((c) => Number(c.id) === Number(item.id) && String(c.pack || "") === String(item.pack || ""));
        if (existing) existing.qty = Math.min(Number(existing.qty || 0) + item.qty, Number(item.stock || 999));
        else cart.push(item);
      }
      localStorage.setItem("freshcut-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      if (j.unavailable?.length) {
        setToast({ ok: true, text: `Added to cart. Not available: ${j.unavailable.join(", ")}` });
        window.setTimeout(() => window.location.assign("/cart"), 1800);
      } else {
        window.location.assign("/cart");
      }
    } catch (e) {
      setToast({ ok: false, text: e instanceof Error ? e.message : "Reorder failed" });
    } finally {
      setReorderingId(null);
    }
  }

  async function logout() {
    try {
      await post({ action: "logout" });
      localStorage.removeItem("freshcut-login");
    } catch {
      /* ignore */
    }
    window.location.assign("/");
  }

  const active = useMemo(() => (data?.orders || []).filter((o) => o.stage >= 0 && o.stage < 3), [data]);
  const filteredOrders = useMemo(() => {
    const list = data?.orders || [];
    if (orderFilter === "Active") return list.filter((o) => o.stage >= 0 && o.stage < 3);
    if (orderFilter === "Delivered") return list.filter((o) => o.stage === 3);
    if (orderFilter === "Cancelled") return list.filter((o) => o.stage === -1);
    return list;
  }, [data, orderFilter]);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl p-3 md:p-5">
        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {error}
            <button onClick={() => void load()} className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="hidden h-80 animate-pulse rounded-xl bg-slate-100 md:block" />
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const { profile, stats, wallet, referral } = data;
  const initials = profile.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-3 md:px-5 md:pt-5">
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* ===== Sidebar ===== */}
        <aside className="hidden md:block">
          <div className="sticky top-[100px] overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-[13px] font-bold text-emerald-800">{initials}</div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold">{profile.name}</div>
                <div className="text-[11px] text-slate-500">+91 {profile.mobile}</div>
              </div>
            </div>
            <nav className="p-1.5">
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
                  {n.key === "track" && active.length > 0 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">{active.length}</span>
                  )}
                  {n.key === "wallet" && <span className="text-[11px] font-semibold text-emerald-700">{rupees(wallet.balance)}</span>}
                </button>
              ))}
            </nav>
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50">
                ⎋ Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-3">
          {/* ===== Mobile tabs ===== */}
          <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 md:hidden">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  tab === n.key ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {n.icon} {n.label}
                {n.key === "track" && active.length > 0 ? ` (${active.length})` : ""}
              </button>
            ))}
          </div>

          {/* ===== OVERVIEW ===== */}
          {tab === "overview" && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="text-[17px] font-bold text-slate-900">Hello, {profile.name.split(" ")[0]} 👋</h1>
                  <p className="text-[12px] text-slate-500">Your orders, wallet and rewards</p>
                </div>
                <a href="/products" className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white">
                  Shop now
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Tile label="Wallet" value={rupees(wallet.balance)} sub={wallet.soonExpiring ? `${rupees(wallet.soonExpiring)} expiring soon` : "Available balance"} tone="text-emerald-700" onClick={() => setTab("wallet")} />
                <Tile label="Active orders" value={String(stats.activeOrders)} sub={stats.activeOrders ? "Track →" : "No active orders"} onClick={() => setTab("track")} />
                <Tile label="Total orders" value={String(stats.totalOrders)} sub={`${stats.delivered} delivered`} onClick={() => setTab("orders")} />
                <Tile label="Referral earned" value={rupees(referral.totalEarned)} sub={`Code ${referral.code}`} tone="text-violet-700" onClick={() => setTab("refer")} />
              </div>

              {active.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-[13px] font-semibold text-slate-800">Orders in progress</h2>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {active.slice(0, 2).map((o) => (
                      <OrderTrackCard key={o.id} order={o} compact />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setTab("refer")}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-left"
              >
                <span className="text-[12px] text-violet-900">
                  🎁 Invite friends — they get <b>{rupees(referral.welcome)}</b>, you get <b>{rupees(referral.reward)}</b> on their first order
                </span>
                <span className="shrink-0 text-[12px] font-bold text-violet-700">Invite →</span>
              </button>

              <Panel
                title="Recent orders"
                right={
                  <button onClick={() => setTab("orders")} className="text-[12px] font-semibold text-emerald-700">
                    See all
                  </button>
                }
              >
                {data.orders.length === 0 ? (
                  <p className="py-4 text-center text-[12px] text-slate-500">No orders yet. Place your first order!</p>
                ) : (
                  <ul className="-my-1 divide-y divide-slate-100">
                    {data.orders.slice(0, 4).map((o) => (
                      <li key={o.id} className="flex items-center gap-2 py-2">
                        <span className="w-10 shrink-0 text-[12px] font-semibold text-slate-500">#{o.id}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-medium text-slate-800">
                            {o.items.map((i) => i.name).join(", ") || "Order"}
                          </div>
                          <div className="text-[10px] text-slate-500">{whenIST(o.createdAt)} · {o.status}</div>
                        </div>
                        <span className="shrink-0 text-[12px] font-semibold tabular-nums">{rupees(o.amount)}</span>
                        {o.items.length > 0 && (
                          <button
                            onClick={() => void reorder(o)}
                            disabled={reorderingId === o.id}
                            className="shrink-0 rounded-md border border-emerald-600 px-2 py-1 text-[11px] font-bold text-emerald-700 disabled:opacity-50"
                          >
                            {reorderingId === o.id ? "…" : "Reorder"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </>
          )}

          {/* ===== MY ORDERS ===== */}
          {tab === "orders" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-[15px] font-bold">My Orders</h1>
                <span className="text-[11px] text-slate-500">{stats.totalOrders} orders · {rupees(stats.totalSpent)} spent</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {(["All", "Active", "Delivered", "Cancelled"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${
                      orderFilter === f ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {filteredOrders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-[12px] text-slate-500">No orders in this list.</p>
              ) : (
                <div className="grid gap-2 lg:grid-cols-2">
                  {filteredOrders.map((o) => (
                    <OrderTrackCard key={o.id} order={o} onReorder={(ord) => void reorder(ord)} reordering={reorderingId === o.id} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== TRACK ===== */}
          {tab === "track" && (
            <>
              <h1 className="text-[15px] font-bold">Track Order</h1>
              {active.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                  <div className="text-2xl">🛵</div>
                  <p className="mt-1 text-[13px] font-semibold">No orders on the way</p>
                  <p className="text-[12px] text-slate-500">Live status will show here when you place an order.</p>
                </div>
              ) : (
                <div className="grid gap-2 lg:grid-cols-2">
                  {active.map((o) => (
                    <OrderTrackCard key={o.id} order={o} />
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-500">The delivery OTP appears here once the order is &quot;On the way&quot;. Share it with the rider only after you receive the order.</p>
            </>
          )}

          {/* ===== WALLET ===== */}
          {tab === "wallet" && (
            <>
              <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Wallet balance</div>
                <div className="mt-1 text-3xl font-extrabold tabular-nums">{rupees(wallet.balance)}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-emerald-100">
                  <span>Total earned {rupees(wallet.earned)}</span>
                  {wallet.soonExpiring > 0 && <span>⚠ {rupees(wallet.soonExpiring)} expiring in 15 days</span>}
                </div>
              </div>
              <Panel title="Wallet history">
                {wallet.transactions.length === 0 ? (
                  <p className="py-4 text-center text-[12px] text-slate-500">
                    No entries yet. Refer a friend and earn {rupees(referral.reward)}.
                  </p>
                ) : (
                  <ul className="-my-1 divide-y divide-slate-100">
                    {wallet.transactions.map((t) => {
                      const expired = t.amount > 0 && new Date(t.expiresAt) < new Date();
                      return (
                        <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-medium text-slate-800">{t.type}</div>
                            <div className="text-[10px] text-slate-500">
                              {whenIST(t.date)}
                              {t.amount > 0 && ` · ${expired ? "expired" : `valid till ${new Date(t.expiresAt).toLocaleDateString("en-IN")}`}`}
                            </div>
                          </div>
                          <span className={`shrink-0 text-[13px] font-bold tabular-nums ${expired ? "text-slate-400 line-through" : t.amount >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            {t.amount >= 0 ? "+" : "−"}
                            {rupees(Math.abs(t.amount))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            </>
          )}

          {/* ===== REFER & EARN ===== */}
          {tab === "refer" && (
            <>
              <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
                <h1 className="text-[16px] font-bold text-slate-900">Refer &amp; Earn 🎁</h1>
                <p className="mt-0.5 text-[12px] text-slate-600">
                  Friend gets <b>{rupees(referral.welcome)}</b> on sign-up · You get <b>{rupees(referral.reward)}</b> when their first order is delivered
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Your code</span>
                  <span className="rounded-lg border-2 border-dashed border-violet-300 bg-white px-3 py-1 font-mono text-lg font-extrabold tracking-[0.2em] text-violet-800">
                    {referral.code}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">The message is ready — just pick an app and send. Anyone who opens your link joins your team automatically.</p>
                <div className="mt-1.5">
                  <InviteShare name={profile.name} code={referral.code} welcome={referral.welcome} reward={referral.reward} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["1", "Send the message on WhatsApp / FB / Insta"],
                  ["2", `Friend signs up and gets ${rupees(referral.welcome)}`],
                  ["3", `First order delivered → you get ${rupees(referral.reward)}`],
                ].map(([n, t]) => (
                  <div key={n} className="rounded-xl border border-slate-200 bg-white p-2">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700">{n}</div>
                    <div className="mt-1 text-[11px] leading-snug text-slate-600">{t}</div>
                  </div>
                ))}
              </div>

              <Panel title="Your invites" right={<span className="text-[11px] font-semibold text-emerald-700">Earned {rupees(referral.totalEarned)}</span>}>
                {referral.friends.length === 0 ? (
                  <p className="py-4 text-center text-[12px] text-slate-500">No friends have joined yet.</p>
                ) : (
                  <ul className="-my-1 divide-y divide-slate-100">
                    {referral.friends.map((f) => (
                      <li key={f.id} className="flex items-center justify-between py-2 text-[12px]">
                        <div>
                          <div className="font-medium tabular-nums">{f.friend}</div>
                          <div className="text-[10px] text-slate-500">{whenIST(f.date)}</div>
                        </div>
                        <span className={f.status === "Completed" ? "font-bold text-emerald-700" : "text-amber-700"}>
                          {f.status === "Completed" ? `+${rupees(f.earned)}` : "Waiting for first order"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </>
          )}

          {/* ===== PROFILE ===== */}
          {tab === "profile" && <ProfileTab profile={profile} post={post} onSaved={load} onToast={setToast} onLogout={logout} />}
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-sm rounded-lg px-3 py-2 text-center text-[12px] font-semibold text-white shadow-lg ${
            toast.ok ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function ProfileTab({
  profile,
  post,
  onSaved,
  onToast,
  onLogout,
}: {
  profile: Data["profile"];
  post: (p: Record<string, unknown>) => Promise<{ message?: string }>;
  onSaved: () => Promise<void>;
  onToast: (t: { ok: boolean; text: string }) => void;
  onLogout: () => Promise<void>;
}) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email || "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState<"" | "profile" | "password">("");
  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="My details">
        <form
          className="space-y-2.5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy("profile");
            try {
              const j = await post({ action: "updateProfile", name, email });
              onToast({ ok: true, text: j.message || "Saved" });
              await onSaved();
            } catch (err) {
              onToast({ ok: false, text: err instanceof Error ? err.message : "Failed" });
            } finally {
              setBusy("");
            }
          }}
        >
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-700">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-700">Mobile</span>
            <input value={`+91 ${profile.mobile}`} disabled className={`${input} bg-slate-50 text-slate-500`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-700">Email (optional)</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={input} />
          </label>
          <button disabled={busy === "profile"} className="w-full rounded-lg bg-emerald-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
            {busy === "profile" ? "Saving…" : "Save details"}
          </button>
          <p className="text-[11px] text-slate-500">Member since {new Date(profile.joinedAt).toLocaleDateString("en-IN")}</p>
        </form>
      </Panel>

      <div className="space-y-3">
        <Panel title="Change password">
          <form
            className="space-y-2.5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy("password");
              try {
                const j = await post({ action: "changePassword", current, next });
                onToast({ ok: true, text: j.message || "Password changed" });
                setCurrent("");
                setNext("");
              } catch (err) {
                onToast({ ok: false, text: err instanceof Error ? err.message : "Failed" });
              } finally {
                setBusy("");
              }
            }}
          >
            <input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={input} />
            <input type="password" placeholder="New password (6+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={input} />
            <button disabled={busy === "password" || !current || next.length < 6} className="w-full rounded-lg border border-slate-300 py-2.5 text-[13px] font-semibold text-slate-800 disabled:opacity-50">
              {busy === "password" ? "Saving…" : "Change password"}
            </button>
          </form>
        </Panel>
        <button onClick={() => void onLogout()} className="w-full rounded-lg border border-rose-200 bg-white py-2.5 text-[13px] font-semibold text-rose-600">
          Logout
        </button>
      </div>
    </div>
  );
}
