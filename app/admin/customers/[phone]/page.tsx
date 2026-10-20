"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrderTrackCard, { rupees, whenIST, type CustomerOrder } from "@/components/customer/order-track-card";

/* Admin > Customer detail — orders (with OTP), wallet, referrals. */

type Detail = {
  phone: string;
  name: string;
  account: { name: string; email: string | null; referralCode: string; joinedAt: string; lastLoginAt: string | null; referredBy: string | null } | null;
  stats: { orders: number; delivered: number; spent: number; cancelled: number };
  orders: CustomerOrder[];
  wallet: { balance: number; transactions: { id: number; credit: number; type: string; createdAt: string; expiresAt: string }[] };
  referrals: { id: number; friend: string; status: string; earned: number; date: string }[];
  referredBy: { name: string; phone: string; status: string } | null;
};

export default function AdminCustomerDetailPage() {
  const params = useParams<{ phone: string }>();
  const phone = String(params?.phone || "");
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (!phone) return;
    fetch(`/api/admin/customer-detail?phone=${encodeURIComponent(phone)}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          return;
        }
        const j = await r.json();
        if (!j.success) throw new Error(j.error);
        setData(j);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load"));
  }, [phone]);

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center">
        <h1 className="text-base font-bold">Admin login required</h1>
        <a href={`/admin/login?next=/admin/customers/${phone}`} className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white">
          Admin login
        </a>
      </div>
    );
  }
  if (error) return <p className="rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{error}</p>;
  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-slate-200/60" />;

  return (
    <div className="space-y-3">
      <Link href="/admin/customers" className="text-[12px] font-semibold text-emerald-700">
        ← All customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div>
          <h1 className="text-[17px] font-bold text-slate-900">{data.name}</h1>
          <div className="text-[12px] text-slate-500">
            <a href={`tel:${data.phone}`} className="font-semibold text-slate-700">
              {data.phone}
            </a>
            {data.account?.email ? ` · ${data.account.email}` : ""}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {data.account
              ? `Account since ${new Date(data.account.joinedAt).toLocaleDateString("en-IN")} · code ${data.account.referralCode}`
              : "Guest (no account)"}
            {data.referredBy ? ` · referred by ${data.referredBy.name}` : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`https://wa.me/91${data.phone}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] font-bold text-white">
            WhatsApp
          </a>
          <a href={`tel:${data.phone}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
            Call
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          ["Orders", String(data.stats.orders)],
          ["Delivered value", rupees(data.stats.spent)],
          ["Cancelled", String(data.stats.cancelled)],
          ["Wallet", rupees(data.wallet.balance)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{k}</div>
            <div className="text-lg font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-2">
          <h2 className="text-[13px] font-semibold text-slate-800">Orders</h2>
          {data.orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white py-6 text-center text-[12px] text-slate-500">No orders yet.</p>
          ) : (
            <div className="grid gap-2 xl:grid-cols-2">
              {data.orders.map((o) => (
                <OrderTrackCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </section>
        <section className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 px-3 py-2 text-[13px] font-semibold">Wallet history</h2>
            <ul className="divide-y divide-slate-100 px-3">
              {data.wallet.transactions.length === 0 && <li className="py-3 text-[12px] text-slate-500">No entries</li>}
              {data.wallet.transactions.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 py-1.5 text-[12px]">
                  <span className="min-w-0 truncate">{t.type}</span>
                  <span className={t.credit >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>
                    {t.credit >= 0 ? "+" : "−"}
                    {rupees(Math.abs(t.credit))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 px-3 py-2 text-[13px] font-semibold">Referrals ({data.referrals.length})</h2>
            <ul className="divide-y divide-slate-100 px-3">
              {data.referrals.length === 0 && <li className="py-3 text-[12px] text-slate-500">No referrals</li>}
              {data.referrals.map((r) => (
                <li key={r.id} className="flex justify-between gap-2 py-1.5 text-[12px]">
                  <span>
                    {r.friend} <span className="text-slate-400">{whenIST(r.date)}</span>
                  </span>
                  <span className={r.status === "Completed" ? "font-semibold text-emerald-700" : "text-amber-700"}>
                    {r.status === "Completed" ? `+${rupees(r.earned)}` : r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
