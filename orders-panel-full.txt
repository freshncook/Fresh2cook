"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type OrderItem = {
  id: number;
  productName: string;
  pack: string;
  quantity: number;
  price: number;
  packed?: boolean;
};

type Order = {
  id: number;
  customer: string;
  phone: string | null;
  address: string | null;
  customerType?: string;
  status: string;

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
  return `?${Number(
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
    action: string
  ) {
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
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.error("PROCESSING ERROR:", data); throw new Error(data.error || "Update failed");
      }

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Update failed"
      );
    } finally {
      setBusyId(null);
    }
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

  return (
    <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white p-4 shadow">
          <div className="text-sm text-slate-500">
            New Orders
          </div>

          <div className="mt-2 text-3xl font-bold">
            {pendingOrders.length}
          </div>
        </div>

        <div className="rounded-xl bg-orange-50 p-4 shadow">
          <div className="text-sm text-orange-600">
            Processing
          </div>

          <div className="mt-2 text-3xl font-bold">
            {processingOrders.length}
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 shadow">
          <div className="text-sm text-blue-600">
            Ready
          </div>

          <div className="mt-2 text-3xl font-bold">
            {readyOrders.length}
          </div>
        </div>

      </div>

      {loading && (
        <div className="rounded-xl bg-white p-8 text-center">
          Loading Orders...
        </div>
      )}

      {!loading &&
        orders.map((order) => {

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
              className="overflow-hidden rounded-xl border bg-white shadow"
            >

              <div className="bg-slate-50 p-4">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <div className="text-lg font-bold">
                      Order #{order.id}
                    </div>

                    <div className="text-sm text-slate-500">
                      {order.customer}
                    </div>

                    <div className="text-xs text-slate-400">
                      {order.phone}
                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        toggleOrder(
                          order.id
                        )
                      }
                      className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-black"
                    >
                      {expanded
                        ? "Hide"
                        : "Open"}
                    </button>

                  </div>

                </div>

              </div>

              {expanded && (

                <div className="p-4">

                  <div className="mb-4 grid gap-3 md:grid-cols-4">

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
                        Status
                      </div>

                      <div className="font-bold">
                        {order.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Timer
                      </div>

                      <div className="font-bold text-orange-600">
                        {timerText(
                          remaining
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        Created
                      </div>

                      <div className="font-bold">
                        {formatDate(
                          order.createdAt
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="overflow-auto rounded-xl border">

                    <table className="w-full text-sm">

                      <thead className="bg-slate-100">

                        <tr>

                          <th className="p-2 text-center">S.No</th><th className="p-2 text-left">
                            ?
                          </th>

                          <th className="p-2 text-center">S.No</th><th className="p-2 text-left">
                            Product
                          </th>

                          <th className="p-2 text-center">
                            Pack
                          </th>

                          <th className="p-2 text-center">
                            Qty
                          </th>

                          

                        </tr>

                      </thead>

                      <tbody>
                        {(order.items || []).map((item) => (

                          <tr
                            key={item.id}
                            className="border-t"
                          >

                            <td className="p-2">

                              <input
                                type="checkbox"
                                checked={
                                  Boolean(item.packed) || Boolean(checkedItems[item.id])
                                }
                                onChange={(e) => toggleItem(item.id, order.id, e.target.checked)}
                              />

                            </td>

                            <td className="p-2 font-medium">
                              {item.productName}
                            </td>

                            <td className="p-2 text-center">
                              {item.packSize || item.pack || item.variantName || "-"}
                            </td>

                            <td className="p-2 text-center">
                              {item.quantity}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  <div className="mt-5 grid gap-2 md:grid-cols-6">

                    <button
                      disabled={
                        busyId === order.id
                      }
                      onClick={() =>
                        updateStep(
                          order.id,
                          "accept"
                        )
                      }
                      className="rounded-lg bg-blue-600 p-3 text-sm font-bold text-black"
                    >
                      1 Accept
                    </button>

                    <button
                      disabled={
                        !allChecked ||
                        busyId === order.id
                      }
                      onClick={() =>
                        updateStep(
                          order.id,
                          "prepare"
                        )
                      }
                      className="rounded-lg bg-amber-500 p-3 text-sm font-bold text-black"
                    >
                      2 Prepare
                    </button>

                    <button
                      disabled={
                        busyId === order.id
                      }
                      onClick={() =>
                        updateStep(
                          order.id,
                          "crossCheck"
                        )
                      }
                      className="rounded-lg bg-purple-600 p-3 text-sm font-bold text-black"
                    >
                      3 Cross Check
                    </button>

                    <button
                      disabled={
                        busyId === order.id
                      }
                      onClick={() =>
                        updateStep(
                          order.id,
                          "sticker"
                        )
                      }
                      className="rounded-lg bg-pink-600 p-3 text-sm font-bold text-black"
                    >
                      4 Sticker
                    </button>

                    <button
                      disabled={
                        busyId === order.id
                      }
                      onClick={() =>
                        updateStep(
                          order.id,
                          "pack"
                        )
                      }
                      className="rounded-lg bg-green-600 p-3 text-sm font-bold text-black"
                    >
                      5 Pack
                    </button>

                    <button disabled={busyId === order.id} onClick={() => updateStep(order.id, "dispatch")} className="rounded-lg bg-slate-900 p-3 text-sm font-bold text-black">
                      6 Print Invoice

                    </button>

                  </div>

                  <div className="mt-5 grid gap-2 md:grid-cols-6">

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 1
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100"
                      }`}
                    >
                      Accept
                    </div>

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 2
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100"
                      }`}
                    >
                      Prepare
                    </div>

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 3
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100"
                      }`}
                    >
                      Check
                    </div>

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 4
                          ? "bg-pink-100 text-pink-700"
                          : "bg-slate-100"
                      }`}
                    >
                      Sticker
                    </div>

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 5
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100"
                      }`}
                    >
                      Packed
                    </div>

                    <div
                      className={`rounded-lg border py-2 text-center text-sm font-semibold min-h-[52px] flex items-center justify-center ${
                        (order.processingStep || 0) >= 6
                          ? "bg-yellow-400 text-black"
                          : "bg-slate-100"
                      }`}
                    >
                      

<div className="mt-3">
  <select
    className="w-full rounded-lg border p-2 text-sm"
    defaultValue=""
  >
    <option value="">
      Select Rider
    </option>

    {(riders || []).map((rider) => (
      <option
        key={rider.id}
        value={rider.id}
      >
        {rider.name} ?{rider.rating || 0}
      </option>
    ))}
  </select>

  
</div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          );

        })}

      {!!error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

    </div>
  );
}


































