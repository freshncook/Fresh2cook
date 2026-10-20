"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  pack: string;
  quantity: number;
  price: number;
  total: number;
};

type Order = {
  id: number;
  customer: string;
  phone: string | null;
  address: string | null;
  amount: number;
  status: string;
  createdAt: string;
  processingStartedAt?: string | null;
  processingDeadline?: string | null;
  readyAt?: string | null;
  items: OrderItem[];
};

type ApiResponse = {
  success?: boolean;
  orders?: Order[];
  error?: string;
};

function money(value: number) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
}

function dateText(value: string) {
  return new Date(
    value
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function remainingSeconds(
  deadline?: string | null
) {
  if (!deadline) return 0;

  return Math.max(
    0,
    Math.ceil(
      (
        new Date(
          deadline
        ).getTime() -
        Date.now()
      ) / 1000
    )
  );
}

function timerText(
  seconds: number
) {
  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return `${String(
    minutes
  ).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}

export default function ProcessingDashboardPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busyId, setBusyId] =
    useState<number | null>(null);

  const [openOrderId, setOpenOrderId] =
    useState<number | null>(null);

  const [tick, setTick] =
    useState(Date.now());

  const loadOrders =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/processing/orders",
            {
              method: "GET",
              cache: "no-store",
              credentials: "include",
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

        setOrders(
          Array.isArray(
            data.orders
          )
            ? data.orders
            : []
        );

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

    const refresh =
      window.setInterval(
        loadOrders,
        5000
      );

    const clock =
      window.setInterval(
        () => {
          setTick(
            Date.now()
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        refresh
      );

      window.clearInterval(
        clock
      );
    };
  }, [loadOrders]);

  async function updateOrder(
    id: number,
    action: "start" | "ready"
  ) {
    try {
      setBusyId(id);
      setError("");

      const response =
        await fetch(
          "/api/processing/orders",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify({
              id,
              action,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update order"
        );
      }

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch(
      "/api/auth/logout",
      {
        method: "POST",
        credentials:
          "include",
      }
    );

    window.location.href =
      "/processing/login";
  }

  const newOrders =
    orders.filter(
      (order) =>
        [
          "Pending",
          "Confirmed",
          "Paid",
          "Payment Received",
        ].includes(
          order.status
        )
    );

  const processingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Processing"
    );

  const readyOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Ready For Dispatch"
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-\[1600px\]">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-emerald-600">
                Fresh2Cook Operations
              </div>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Processing Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Order processing &
                packing control
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <div className="text-sm font-bold text-emerald-700">
                New Orders
              </div>

              <div className="mt-2 text-3xl font-black">
                {newOrders.length}
              </div>
            </div>

            <div className="rounded-2xl bg-orange-50 p-5">
              <div className="text-sm font-bold text-orange-700">
                Processing
              </div>

              <div className="mt-2 text-3xl font-black">
                {processingOrders.length}
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <div className="text-sm font-bold text-blue-700">
                Ready For Dispatch
              </div>

              <div className="mt-2 text-3xl font-black">
                {readyOrders.length}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
              {error}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b bg-slate-50 px-5 py-4">
              <h2 className="text-xl font-black text-slate-900">
                Processing Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Open “Packing Details” to
                see exactly what must go
                into the customer order.
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No active orders.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {orders.map(
                  (order) => {
                    const isStartable =
                      [
                        "Pending",
                        "Confirmed",
                        "Paid",
                        "Payment Received",
                      ].includes(
                        order.status
                      );

                    const isProcessing =
                      order.status ===
                      "Processing";

                    const isReady =
                      order.status ===
                      "Ready For Dispatch";

                    const seconds =
                      isProcessing
                        ? remainingSeconds(
                            order.processingDeadline
                          )
                        : 0;

                    const overdue =
                      isProcessing &&
                      !!order.processingDeadline &&
                      new Date(
                        order.processingDeadline
                      ).getTime() <
                        tick;

                    const isOpen =
                      openOrderId ===
                      order.id;

                    const totalItems =
                      order.items.reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          Number(
                            item.quantity ||
                              0
                          ),
                        0
                      );

                    return (
                      <div
                        key={order.id}
                        className="p-5"
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xl font-black">
                                  Order #
                                  {
                                    order.id
                                  }
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
                                  {
                                    order.status
                                  }
                                </span>
                              </div>

                              <div className="mt-3 text-lg font-bold">
                                {
                                  order.customer
                                }
                              </div>

                              <div className="mt-1 text-sm text-slate-500">
                                {
                                  order.phone
                                }
                              </div>

                              <div className="mt-1 text-sm text-slate-500">
                                {
                                  order.address
                                }
                              </div>

                              <div className="mt-3 text-sm font-black">
                                Order Value:{" "}
                                {money(
                                  order.amount
                                )}
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                Received:{" "}
                                {dateText(
                                  order.createdAt
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenOrderId(
                                    isOpen
                                      ? null
                                      : order.id
                                  )
                                }
                                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
                              >
                                {isOpen
                                  ? "Hide Packing Details"
                                  : "View Packing Details"}
                              </button>

                              {isStartable && (
                                <button
                                  type="button"
                                  disabled={
                                    busyId ===
                                    order.id
                                  }
                                  onClick={() =>
                                    updateOrder(
                                      order.id,
                                      "start"
                                    )
                                  }
                                  className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {busyId ===
                                  order.id
                                    ? "Starting..."
                                    : "Start Processing"}
                                </button>
                              )}

                              {isProcessing && (
                                <>
                                  <div className="rounded-2xl bg-orange-50 px-5 py-3 text-center">
                                    <div className="text-xs font-bold text-slate-500">
                                      Time Remaining
                                    </div>

                                    <div
                                      className={`text-2xl font-black tabular-nums ${
                                        overdue
                                          ? "text-red-600"
                                          : "text-orange-600"
                                      }`}
                                    >
                                      {overdue
                                        ? "00:00"
                                        : timerText(
                                            seconds
                                          )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={
                                      busyId ===
                                      order.id
                                    }
                                    onClick={() =>
                                      updateOrder(
                                        order.id,
                                        "ready"
                                      )
                                    }
                                    className="rounded-xl bg-blue-600 px-6 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {busyId ===
                                    order.id
                                      ? "Saving..."
                                      : "Ready For Dispatch"}
                                  </button>
                                </>
                              )}

                              {isReady && (
                                <div className="rounded-2xl bg-blue-50 px-5 py-3 text-center">
                                  <div className="text-xs font-bold uppercase text-blue-600">
                                    Dispatch Queue
                                  </div>

                                  <div className="font-black text-blue-900">
                                    READY
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {isOpen && (
                            <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-black text-slate-900">
                                    WHAT TO PACK
                                  </h3>

                                  <p className="text-sm text-slate-500">
                                    Order #{order.id}
                                  </p>
                                </div>

                                <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700">
                                  Total Items:{" "}
                                  {
                                    totalItems
                                  }
                                </div>
                              </div>

                              {order.items.length ===
                              0 ? (
                                <div className="mt-4 rounded-xl bg-white p-4 text-sm font-semibold text-red-600">
                                  No product
                                  items found
                                  for this
                                  order.
                                </div>
                              ) : (
                                <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
                                  <table className="w-full min-w-[650px] border-collapse">
                                    <thead>
                                      <tr className="border-b bg-slate-900 text-left text-sm text-white">
                                        <th className="px-4 py-3">
                                          Product
                                        </th>

                                        <th className="px-4 py-3">
                                          Pack /
                                          Weight
                                        </th>

                                        <th className="px-4 py-3 text-center">
                                          Qty
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                          Amount
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {order.items.map(
                                        (
                                          item
                                        ) => (
                                          <tr
                                            key={
                                              item.id
                                            }
                                            className="border-b last:border-b-0"
                                          >
                                            <td className="px-4 py-4 font-bold text-slate-900">
                                              {
                                                item.productName
                                              }
                                            </td>

                                            <td className="px-4 py-4 font-semibold text-slate-600">
                                              {
                                                item.pack
                                              }
                                            </td>

                                            <td className="px-4 py-4 text-center text-lg font-black text-slate-900">
                                              {
                                                item.quantity
                                              }
                                            </td>

                                            <td className="px-4 py-4 text-right font-bold text-slate-700">
                                              {money(
                                                item.total
                                              )}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

