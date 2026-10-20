"use client";

/*
 * One order with its delivery progress, OTP (while on the way) and rider.
 * Used on My Account and on the public Track Order page.
 */

export type CustomerOrder = {
  id: number;
  status: string;
  stage: number; // -1 cancelled, 0 placed, 1 packed, 2 on the way, 3 delivered
  amount: number;
  address: string | null;
  createdAt: string;
  packedAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  otp: string | null;
  rider: { name: string; mobile: string | null } | null;
  items: { productId: number; name: string; pack: string | null; qty: number; price: number }[];
};

export const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const whenIST = (v: string | null) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "";

const STEPS = [
  { label: "Order placed", key: "createdAt" },
  { label: "Packed", key: "packedAt" },
  { label: "On the way", key: "dispatchedAt" },
  { label: "Delivered", key: "deliveredAt" },
] as const;

export function StatusPill({ order }: { order: CustomerOrder }) {
  const cls =
    order.stage === -1
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : order.stage === 3
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : order.stage === 2
          ? "bg-cyan-50 text-cyan-700 ring-cyan-200"
          : "bg-amber-50 text-amber-700 ring-amber-200";
  const text = order.stage === -1 ? "Cancelled" : STEPS[Math.max(0, order.stage)].label;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>{text}</span>;
}

export default function OrderTrackCard({
  order,
  onReorder,
  reordering,
  compact = false,
}: {
  order: CustomerOrder;
  onReorder?: (order: CustomerOrder) => void;
  reordering?: boolean;
  compact?: boolean;
}) {
  const itemCount = order.items.reduce((s, i) => s + Number(i.qty || 0), 0);

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-slate-900">#{order.id}</span>
            <StatusPill order={order} />
          </div>
          <div className="text-[11px] text-slate-500">
            {whenIST(order.createdAt)} · {itemCount} items
          </div>
        </div>
        <div className="text-right text-[15px] font-bold tabular-nums text-slate-900">{rupees(order.amount)}</div>
      </div>

      {order.stage >= 0 && (
        <ol className="mt-2.5 grid grid-cols-4 gap-1">
          {STEPS.map((s, i) => (
            <li key={s.key} className="min-w-0">
              <div className={`h-1 rounded-full ${i <= order.stage ? "bg-emerald-500" : "bg-slate-200"}`} />
              <div className={`mt-1 truncate text-[9px] ${i <= order.stage ? "font-semibold text-slate-700" : "text-slate-400"}`}>{s.label}</div>
              {!compact && order[s.key] && i <= order.stage && <div className="truncate text-[9px] text-slate-400">{whenIST(order[s.key])}</div>}
            </li>
          ))}
        </ol>
      )}

      {order.otp && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Delivery OTP</div>
            <div className="text-[11px] text-amber-800">Share it with the rider only after you receive the order</div>
          </div>
          <div className="font-mono text-xl font-extrabold tracking-[0.25em] text-amber-900">{order.otp}</div>
        </div>
      )}

      {order.rider && order.stage === 2 && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
          <span className="text-slate-600">
            🛵 <b className="text-slate-800">{order.rider.name}</b> is bringing your order
          </span>
          {order.rider.mobile && (
            <a href={`tel:${order.rider.mobile}`} className="shrink-0 rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              📞 Call
            </a>
          )}
        </div>
      )}

      {!compact && (
        <details className="mt-2 text-[12px]">
          <summary className="cursor-pointer select-none text-slate-600">Items &amp; address</summary>
          <ul className="mt-1.5 divide-y divide-slate-100 rounded-lg border border-slate-100">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-2 px-2 py-1">
                <span className="min-w-0 truncate">
                  {i.name} {i.pack && <span className="text-slate-400">{i.pack}</span>}
                </span>
                <span className="shrink-0 tabular-nums text-slate-600">
                  {i.qty} × {rupees(i.price)}
                </span>
              </li>
            ))}
          </ul>
          {order.address && <p className="mt-1.5 text-slate-600">📍 {order.address}</p>}
        </details>
      )}

      {onReorder && order.items.length > 0 && (
        <button
          onClick={() => onReorder(order)}
          disabled={reordering}
          className="mt-2.5 w-full rounded-lg border border-emerald-600 py-2 text-[13px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          {reordering ? "Adding…" : "↻ Reorder"}
        </button>
      )}
    </article>
  );
}
