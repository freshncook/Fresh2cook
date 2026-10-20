"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { HelpPanel, MyPackingPanel, ProfilePanel, StaffCard, SuppliesPanel, WalletPanel, useMe } from "@/components/processing-staff-panels";

type OrderItem = {
  id: number;
  productName: string;
  pack?: string | null;
  packSize?: string | null;
  variantName?: string | null;
  quantity: number;
  price: number;
  packed?: boolean;
};

type Order = {
  id: number;
  customer: string;
  phone: string | null;
  address: string | null;
  deliveryAddress?: string | null;
  shippingAddress?: string | null;
  customerAddress?: string | null;
  customerType?: string;
  status: string;
  assignedRiderName?: string | null;
  riderName?: string | null;
  assignedRider?: { name?: string | null } | null;
  rider?: { name?: string | null } | null;

  processingStep?: number;

  deliveryOtp?: string | null;

  acceptedByName?: string | null;
  preparedByName?: string | null;
  crossCheckedByName?: string | null;
  stickerByName?: string | null;
  packagingByName?: string | null;

  processingStartedAt?: string | null;
  processingDeadline?: string | null;

  readyAt?: string | null;

  items?: OrderItem[];

  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  orders?: Order[];
  error?: string;
};

function formatMoney(
  value: number
) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
}

function formatDate(
  value?: string | null
) {
  if (!value) return "-";

  try {
    return new Date(
      value
    ).toLocaleString("en-IN");
  } catch {
    return value;
  }
}

function getRemainingSeconds(
  deadline?: string | null
) {
  if (!deadline) return 0;

  const remaining =
    new Date(deadline).getTime() -
    Date.now();

  return Math.max(
    0,
    Math.ceil(remaining / 1000)
  );
}

function timerText(
  totalSeconds: number
) {
  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

export default function ProcessingOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
const [riders, setRiders] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busyId, setBusyId] =
    useState<number | null>(null);

  const [now, setNow] =
    useState(Date.now());

  const [
    expandedOrders,
    setExpandedOrders,
  ] = useState<
    Record<number, boolean>
  >({});

  const [
    checkedItems,
    setCheckedItems,
  ] = useState<
    Record<number, boolean>
  >({});

  const [stepChecks, setStepChecks] =
    useState<Record<string, boolean>>({});

  const [selectedRiders, setSelectedRiders] =
    useState<Record<number, string>>({});

  const [view, setView] = useState<"all" | "Pending" | "Processing" | "Ready For Dispatch">("all");
  const [section, setSection] = useState<"orders" | "mine" | "wallet" | "profile" | "supplies" | "help">("orders");
  const me = useMe();
  const [query, setQuery] = useState("");

  const [orderMessages, setOrderMessages] =
    useState<Record<number, { type: "success" | "error"; text: string }>>({});

  const loadOrders =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/processing/orders",
            {
              cache: "no-store",
            }
          );

        const data: ApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load orders"
          );
        }

        setOrders(data.orders || []);
setRiders((data as any).riders || []);

        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadOrders();

    const poll =
      window.setInterval(
        loadOrders,
        5000
      );

    return () =>
      window.clearInterval(
        poll
      );
  }, [loadOrders]);

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  function toggleOrder(
    orderId: number
  ) {
    setExpandedOrders(
      (prev) => ({
        ...prev,
        [orderId]:
          !prev[orderId],
      })
    );
  }

  
async function toggleItem(
  itemId: number,
  orderId: number,
  packed: boolean
) {
  try {

    const response =
      await fetch(
        "/api/processing/orders",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "packItem",
            orderId,
            itemId,
            packed,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Packing update failed"
      );
    }

    setCheckedItems(
      (prev) => ({
        ...prev,
        [itemId]: packed,
      })
    );

    await loadOrders();

  } catch (err) {

    setError(
      err instanceof Error
        ? err.message
        : "Packing update failed"
    );

  }
}
async function updateStep(
    id: number,
    action: string,
    extra: Record<string, unknown> = {}
  ): Promise<boolean> {
    try {
      setBusyId(id);

      const response =
        await fetch(
          "/api/processing/orders",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId: id,
              action,
              ...extra,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.error("PROCESSING ERROR:", data); throw new Error(data.error || "Update failed");
      }

      await loadOrders();
      setError("");
      setOrderMessages((prev) => ({
        ...prev,
        [id]: { type: "success", text: data.message || "Done" },
      }));
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Update failed";
      setError(`Order #${id}: ${message}`);
      setOrderMessages((prev) => ({
        ...prev,
        [id]: { type: "error", text: message },
      }));
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function printInvoice(order: Order, existingPopup?: Window | null) {
    const popup =
      existingPopup && !existingPopup.closed
        ? existingPopup
        : window.open("", "_blank", "width=820,height=700");
    if (!popup) {
      setError("Invoice popup was blocked. Allow pop-ups and try again.");
      return;
    }

    const escapeHtml = (value: unknown) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[character] as string));

    const rows = (order.items || []).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.productName)}</td>
        <td>${escapeHtml(item.packSize || item.pack || item.variantName || "-")}</td>
        <td style="text-align:right">${Number(item.quantity || 0)}</td>
        <td style="text-align:right">₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
        <td style="text-align:right">₹${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const total = (order.items || []).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const address = order.address || order.deliveryAddress || order.shippingAddress || order.customerAddress || "-";

    popup.document.write(`<!doctype html>
      <html><head><title>Invoice - Order #${escapeHtml(order.id)}</title>
      <meta charset="utf-8" />
      <style>
        body{font-family:Arial,sans-serif;color:#111;padding:28px}
        h1{margin:0 0 4px;font-size:24px}
        .muted{color:#555;font-size:12px}
        .details{margin:24px 0;line-height:1.6}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #bbb;padding:9px;font-size:12px}
        th{background:#f1f5f9;text-align:left}
        .total{text-align:right;font-size:18px;font-weight:bold;margin-top:18px}
        @media print{button{display:none}}
      </style></head><body>
      <h1>Fresh2Cook — Invoice</h1>
      <div class="muted">Order #${escapeHtml(order.id)} · ${escapeHtml(formatDate(order.createdAt))}</div>
      <div class="details"><strong>Customer:</strong> ${escapeHtml(order.customer)}<br/>
      <strong>Phone:</strong> ${escapeHtml(order.phone || "-")}<br/>
      <strong>Delivery Address:</strong> ${escapeHtml(address)}</div>
      <table><thead><tr><th>S.No</th><th>Product</th><th>Pack</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="total">Grand Total: ₹${total.toLocaleString("en-IN")}</div>
      <div style="margin-top:22px;border-radius:16px;padding:16px;text-align:center;color:#fff;background:linear-gradient(90deg,#047857,#16a34a,#84cc16)">
        <div style="font-size:24px;font-weight:900;letter-spacing:.5px">🙏 धन्यवाद · Thank You!</div>
        <div style="margin-top:4px;font-size:13px;font-weight:700;color:#fef9c3">यह ऑर्डर आपके परिवार के स्वास्थ्य, खुशहाली और समृद्धि का कारण बने।</div>
        <div style="margin-top:4px;font-size:11px;font-weight:600">Fresh · Hygienic · Ready to Cook — Fresh2Cook 💚 · Care 9811001901</div>
      </div>
      <script>window.onload=function(){window.focus();window.print();};</script>
      </body></html>`);
    popup.document.close();
    popup.focus();
  }

  const pendingOrders =
    useMemo(
      () =>
        orders.filter(
          (x) =>
            x.status ===
            "Pending"
        ),
      [orders]
    );

  const processingOrders =
    useMemo(
      () =>
        orders.filter(
          (x) =>
            x.status ===
            "Processing"
        ),
      [orders]
    );

  const readyOrders =
    useMemo(
      () =>
        orders.filter(
          (x) =>
            x.status ===
            "Ready For Dispatch"
        ),
      [orders]
    );

  const q = query.trim().toLowerCase();
  const visibleOrders = orders.filter(
    (o) =>
      (view === "all" || o.status === view) &&
      (!q || String(o.id).includes(q) || String(o.customer || "").toLowerCase().includes(q))
  );
  const tabs = [
    { key: "all" as const, label: "All orders", icon: "📋", count: orders.length, tone: "bg-slate-900 text-white" },
    { key: "Pending" as const, label: "New", icon: "🆕", count: pendingOrders.length, tone: "bg-amber-500 text-white" },
    { key: "Processing" as const, label: "In progress", icon: "🔪", count: processingOrders.length, tone: "bg-orange-500 text-white" },
    { key: "Ready For Dispatch" as const, label: "Ready", icon: "📦", count: readyOrders.length, tone: "bg-blue-600 text-white" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-sm lg:flex">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 px-4 py-2.5">
          <div className="text-[15px] font-black text-emerald-700">Fresh2Cook</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Processing centre</div>
        </div>
        <StaffCard data={me.data} />
        <nav className="flex-1 space-y-0.5 p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setSection("orders");
                setView(t.key);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition ${
                section === "orders" && view === t.key ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              <span className={`min-w-[22px] rounded-full px-1.5 text-center text-[11px] font-bold ${t.count ? t.tone : "bg-slate-100 text-slate-400"}`}>{t.count}</span>
            </button>
          ))}
          <div className="my-2 border-t border-slate-100" />
          {(
            [
              ["mine", "🏆", "My packing & reward"],
              ["wallet", "👛", "My wallet"],
              ["profile", "🪪", "Profile & KYC"],
              ["supplies", "🧰", "Supplies & stickers"],
              ["help", "🛠", "Help & troubleshooting"],
            ] as const
          ).map(([k, icon, label]) => (
            <button
              key={k}
              onClick={() => setSection(k)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition ${
                section === k ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{icon}</span>
              <span className="flex-1">{label}</span>
              {k === "supplies" && me.data && me.data.supplies.some((x) => x.balance < x.min) && <span className="h-2 w-2 rounded-full bg-rose-500" />}
              {k === "profile" && me.data && me.data.kyc.status !== "Approved" && <span className="rounded bg-amber-400 px-1 text-[9px] font-bold text-slate-900">KYC</span>}
              {k === "help" && me.data && me.data.troubleshoot.overdue.length > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{me.data.troubleshoot.overdue.length}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-2">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
              window.location.href = "/processing/login";
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-rose-600 hover:bg-rose-50"
          >
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="min-w-0 flex-1 space-y-2 p-3 pb-24 lg:pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h1 className="text-[16px] font-extrabold text-slate-900">
              {section === "orders" ? "Processing dashboard" : section === "mine" ? "My packing & reward" : section === "wallet" ? "My wallet" : section === "profile" ? "Profile & KYC" : section === "supplies" ? "Supplies & stickers" : "Help & troubleshooting"}
            </h1>
            {me.data && <p className="text-[11px] font-semibold text-emerald-700 lg:hidden">👤 {me.data.me.name} · today {me.data.stats.today} packed · {`₹${me.data.stats.rewardToday}`}</p>}
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live · refreshes automatically
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order # or name"
            className="w-44 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-emerald-500 focus:outline-none sm:w-56"
          />
          <button onClick={() => void loadOrders()} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
            ↻
          </button>
        </div>

        {section === "mine" && <MyPackingPanel data={me.data} />}
        {section === "supplies" && <SuppliesPanel data={me.data} reload={me.reload} />}
        {section === "wallet" && <WalletPanel data={me.data} />}
        {section === "profile" && <ProfilePanel data={me.data} reload={me.reload} />}
        {section === "help" && <HelpPanel data={me.data} onOpenOrder={() => setSection("orders")} />}

        {section === "orders" && (<>
        {/* KPI chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`rounded-xl border bg-white px-2 py-1.5 text-left transition ${view === t.key ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-300"}`}
            >
              <div className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t.icon} {t.label}
              </div>
              <div className="text-[20px] font-black leading-tight text-slate-900">{t.count}</div>
            </button>
          ))}
        </div>

      {!!error && (
        <div className="sticky top-0 z-10 rounded-lg border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl bg-white p-8 text-center">
          Loading Orders...
        </div>
      )}

      {!loading && visibleOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <div className="text-3xl">🧺</div>
          <div className="mt-1 text-[14px] font-bold text-slate-800">{orders.length ? "No orders in this view" : "No orders to process right now"}</div>
          <div className="text-[12px] text-slate-500">New orders appear here automatically — keep this page open.</div>
        </div>
      )}

      {!loading &&
        visibleOrders.map((order) => {

          const expanded =
            expandedOrders[
              order.id
            ];

          const remaining =
            getRemainingSeconds(
              order.processingDeadline
            );

          const allChecked =
            (order.items || [])
              .length > 0 &&
            (order.items || []).every(
              (item) =>
                item.packed === true || checkedItems[item.id]
            );

          return (

            <div
              key={order.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >

              <div className="bg-slate-50 px-3 py-2">

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <div>

                    <div className="flex flex-wrap items-center gap-2 text-base font-bold leading-5">
                      <span>Order #{order.id}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                        order.status === "Assigned To Rider"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : order.status === "Ready For Dispatch"
                            ? "border-blue-200 bg-blue-100 text-blue-800"
                            : order.status === "Processing"
                              ? "border-amber-200 bg-amber-100 text-amber-800"
                              : "border-slate-200 bg-white text-slate-700"
                      }`}>
                        {order.status || "Pending"}
                      </span>
                      {order.status === "Assigned To Rider" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Rider: {(order.assignedRiderName || order.riderName || order.assignedRider?.name || order.rider?.name || "Name unavailable")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{order.customer}</span>{order.phone && <span>{order.phone}</span>}{(order.address || order.deliveryAddress || order.shippingAddress || order.customerAddress) && <span className="max-w-[420px] truncate text-slate-500" title={order.address || order.deliveryAddress || order.shippingAddress || order.customerAddress || ""}>📍 {order.address || order.deliveryAddress || order.shippingAddress || order.customerAddress}</span>}</div>

                    

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        toggleOrder(
                          order.id
                        )
                      }
                      className="rounded-lg bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                    >
                      {expanded
                        ? "Hide"
                        : "Open"}
                    </button>

                  </div>

                </div>

              </div>

              {expanded && (

                <div className="p-3">

                  <div className="mb-2 grid grid-cols-2 items-stretch gap-2 md:grid-cols-4">

                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={busyId === order.id || (order.processingStep || 0) >= 1}
                        onClick={() => void updateStep(order.id, "accept")}
                        className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {(order.processingStep || 0) >= 1 ? `Accepted${order.acceptedByName ? ` · ${order.acceptedByName}` : ""}` : "1 Accept"}
                      </button>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Customer Category
                      </div>
                      <div className="font-bold">
                        {(order.customerType || 'New')}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Timer
                      </div>
                      <div className="font-bold text-orange-600">
                        {timerText(remaining)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Created
                      </div>
                      <div className="font-bold">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                  </div>


                  <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                    <div className="min-w-0 overflow-auto rounded-lg border">
                    <table className="w-full table-fixed text-xs">

                      <thead className="bg-slate-100">

                        <tr>

                          <th className="w-14 px-1.5 py-1.5 text-center">Sr. No</th>

                          <th className="px-2 py-1.5 text-left">
                            Product
                          </th>

                          <th className="w-20 px-1.5 py-1.5 text-center">
                            Pack
                          </th>

                          <th className="w-14 px-1.5 py-1.5 text-center">
                            Qty
                          </th>

                          <th className="w-16 px-1.5 py-1.5 text-center">Packed</th>

                          

                        </tr>

                      </thead>

                      <tbody>
                        {(order.items || []).map((item, index) => (

                          <tr
                            key={item.id}
                            className="border-t"
                          >

                            <td className="px-1.5 py-1 text-center font-semibold">
                              {index + 1}
                            </td>

                            <td className="px-2 py-1 font-medium">
                              {item.productName}
                            </td>

                            <td className="whitespace-nowrap px-1 py-1 text-center text-xs">
                              {item.pack || item.packSize || item.variantName || "-"}
                            </td>

                            <td className="px-1 py-1 text-center tabular-nums">
                              {Number(item.quantity || 0)}
                            </td>

                            <td className="px-1 py-1 text-center">
                              <input
                                aria-label={`Packed ${item.productName}`}
                                type="checkbox"
                                checked={Boolean(item.packed) || Boolean(checkedItems[item.id])}
                                onChange={(e) => toggleItem(item.id, order.id, e.target.checked)}
                              />
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                    </div>
                    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                      <div className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Processing Steps 2–6</div>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
                    {[
                      { step: 2, action: "prepare", label: "2 Prepare", color: "bg-amber-500 text-slate-950", needsItems: true },
                      { step: 3, action: "crossCheck", label: "3 Cross Check", color: "bg-purple-600 text-white", needsItems: false },
                      { step: 4, action: "sticker", label: "4 Sticker", color: "bg-pink-600 text-white", needsItems: false },
                      { step: 5, action: "pack", label: "5 Final Pack", color: "bg-green-600 text-white", needsItems: false },
                      { step: 6, action: "dispatch", label: "6 Invoice + Rider", color: "bg-yellow-400 text-slate-950", needsItems: false },
                    ].map((step) => {
                      const checkKey = `${order.id}-${step.step}`;
                      const isChecked = Boolean(stepChecks[checkKey]);
                      const currentStep = order.processingStep || 0;
                      const isDone = currentStep >= step.step;
                      const isLocked = currentStep < step.step - 1;
                      const blockReason = isDone
                        ? ""
                        : currentStep < 1
                          ? "Press 1 Accept first."
                          : isLocked
                            ? `Finish step ${step.step - 1} first.`
                            : step.needsItems && !allChecked
                              ? "Tick all products first."
                              : step.step === 6 && !selectedRiders[order.id]
                                ? "Select rider first."
                                : !isChecked
                                  ? `Tick "Confirm step ${step.step}" first.`
                                  : "";
                      const disabled =
                        busyId === order.id ||
                        isDone ||
                        Boolean(blockReason);
                      return (
                        <div key={step.step} className="flex min-w-0 flex-col gap-1 rounded-md border border-slate-200 bg-white p-1">
                          <label className="flex min-h-5 cursor-pointer items-center gap-1 text-[10px] font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              disabled={isDone}
                              checked={isDone || isChecked}
                              onChange={(event) =>
                                setStepChecks((previous) => ({
                                  ...previous,
                                  [checkKey]: event.target.checked,
                                }))
                              }
                            />
                            Confirm step {step.step}
                          </label>
                          {step.step === 6 && (
                            <select
                              aria-label={`Select rider for order ${order.id}`}
                              value={selectedRiders[order.id] || ""}
                              onChange={(event) =>
                                setSelectedRiders((previous) => ({
                                  ...previous,
                                  [order.id]: event.target.value,
                                }))
                              }
                              disabled={busyId === order.id || riders.length === 0}
                              className="w-full rounded border border-slate-300 bg-white px-1 py-1 text-[10px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                              <option value="">{riders.length ? "Select approved rider" : "No approved riders available"}</option>
                              {riders.map((rider: any) => (
                                <option key={rider.id} value={String(rider.id)}>
                                  {rider.name}{rider.mobile ? ` · ${rider.mobile}` : ""}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            disabled={disabled}
                            onClick={async () => {
                              if (step.step === 6) {
                                // Open the window directly from the click so the browser
                                // does not block it, but only print once the rider is saved.
                                const popup = window.open("", "_blank", "width=820,height=700");
                                const ok = await updateStep(order.id, step.action, {
                                  riderId: Number(selectedRiders[order.id]),
                                });
                                if (ok) {
                                  printInvoice(order, popup);
                                } else {
                                  popup?.close();
                                }
                                return;
                              }
                              await updateStep(order.id, step.action);
                            }}
                            className={`min-h-[30px] w-full rounded px-1 py-1 text-[10px] leading-tight font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${step.color}`}
                          >
                            {isDone ? `✓ ${step.label}` : busyId === order.id ? "Saving…" : step.label}
                          </button>
                          {blockReason && (
                            <span className="text-[9px] leading-tight text-red-600">{blockReason}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {orderMessages[order.id] && (
                    <div
                      className={`mt-1.5 rounded border px-2 py-1 text-[11px] font-semibold ${
                        orderMessages[order.id].type === "error"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {orderMessages[order.id].type === "error" ? "Error: " : "✓ "}
                      {orderMessages[order.id].text}
                    </div>
                  )}

                  </div>
                  </div>

                </div>

              )}

            </div>

          );

        })}
        </>)}

      </main>

      {/* ===== Bottom tabs (mobile) ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white lg:hidden">
        {(
          [
            ["orders", "📋", "Orders", orders.length],
            ["mine", "🏆", "Packing", 0],
            ["wallet", "👛", "Wallet", 0],
            ["profile", "🪪", "Profile", 0],
            ["supplies", "🧰", "Supplies", 0],
            ["help", "🛠", "Help", me.data?.troubleshoot.overdue.length || 0],
          ] as const
        ).map(([k, icon, label, count]) => (
          <button key={k} onClick={() => setSection(k)} className={`flex flex-col items-center py-1.5 text-[10px] font-bold ${section === k ? "text-emerald-700" : "text-slate-500"}`}>
            <span className="relative text-[18px]">
              {icon}
              {count > 0 && <span className="absolute -right-3 -top-1 rounded-full bg-rose-500 px-1 text-[9px] text-white">{count}</span>}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}