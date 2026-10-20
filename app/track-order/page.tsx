"use client";

import { useEffect, useState } from "react";
import OrderTrackCard, { type CustomerOrder } from "@/components/customer/order-track-card";

/*
 * Track Order — logged-in customers see their active orders automatically.
 * Guests enter Order number + mobile number.
 */

export default function TrackOrderPage() {
  const [mine, setMine] = useState<CustomerOrder[] | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<CustomerOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("order")) setOrderId(p.get("order")!.replace(/\D/g, ""));
    try {
      const saved = localStorage.getItem("freshcut-phone");
      if (saved) setPhone(saved.replace(/\D/g, "").slice(-10));
    } catch {
      /* ignore */
    }
    fetch("/api/track-order", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setLoggedIn(false);
          return;
        }
        const j = await r.json();
        setLoggedIn(true);
        setMine(j.orders || []);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFound(null);
    try {
      const r = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || "Order not found");
      setFound(j.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setBusy(false);
    }
  }

  const active = (mine || []).filter((o) => o.stage >= 0 && o.stage < 3);
  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="mx-auto max-w-xl space-y-3 px-3 py-4 pb-24">
      <div>
        <h1 className="text-[18px] font-bold text-slate-900">Track Order</h1>
        <p className="text-[12px] text-slate-500">Live status, rider details and delivery OTP</p>
      </div>

      {loggedIn && (
        <div className="space-y-2">
          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-[12px] text-slate-500">
              No orders on the way right now.{" "}
              <a href="/account?tab=orders" className="font-semibold text-emerald-700">
                Order history →
              </a>
            </div>
          ) : (
            active.map((o) => <OrderTrackCard key={o.id} order={o} />)
          )}
        </div>
      )}

      <form onSubmit={search} className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="text-[13px] font-semibold text-slate-800">{loggedIn ? "Find another order" : "Track by order number"}</div>
        <div className="grid grid-cols-[1fr_1.4fr] gap-2">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" placeholder="Order #" required className={input} />
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="Mobile number" required className={input} />
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-emerald-600 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
          {busy ? "Searching…" : "Track"}
        </button>
        {loggedIn === false && (
          <p className="text-center text-[12px] text-slate-500">
            To see all your orders in one place,{" "}
            <a href="/login?next=/account?tab=track" className="font-semibold text-emerald-700">
              log in
            </a>
          </p>
        )}
      </form>

      {found && <OrderTrackCard order={found} />}
    </div>
  );
}
