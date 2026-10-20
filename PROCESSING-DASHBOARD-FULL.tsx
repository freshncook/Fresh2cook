"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Item = {
  id: number;
  productName: string;
  pack: string;
  quantity: number;
  total: number;
  packed: boolean;
};

type Order = {
  id: number;
  customer: string;
  phone: string | null;
  address: string | null;
  amount: number;
  status: string;
  createdAt: string;

  processingStep: number;

  processingAcceptedById:
    number | null;

  processingAcceptedAt:
    string | null;

  processingPreparedAt:
    string | null;

  processingCrossCheckedAt:
    string | null;

  processingStickerAt:
    string | null;

  processingPackagingAt:
    string | null;

  processingDispatchedById:
    number | null;

  processingDeadline:
    string | null;

  acceptedByName:
    string | null;

  preparedByName:
    string | null;

  crossCheckedByName:
    string | null;

  stickerByName:
    string | null;

  packagingByName:
    string | null;

  dispatchedByName:
    string | null;

  items: Item[];
};

type Staff = {
  id: number;
  name: string;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  orders?: Order[];
  currentStaff?: Staff;
};

function money(
  amount: number
) {
  return `Ã¢â€šÂ¹${Number(
    amount || 0
  ).toLocaleString(
    "en-IN"
  )}`;
}

function timeText(
  value: string | null
) {
  if (!value)
    return "-";

  return new Date(
    value
  ).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function timer(
  deadline: string | null
) {
  if (!deadline)
    return "30:00";

  const seconds =
    Math.max(
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

  const m =
    Math.floor(
      seconds / 60
    );

  const s =
    seconds % 60;

  return `${String(
    m
  ).padStart(
    2,
    "0"
  )}:${String(
    s
  ).padStart(
    2,
    "0"
  )}`;
}

export default function ProcessingDashboardPage() {
  const [orders, setOrders] =
    useState<Order[]>(
      []
    );

  const [staff, setStaff] =
    useState<Staff | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busyOrder, setBusyOrder] =
    useState<number | null>(
      null
    );

  const [busyItem, setBusyItem] =
    useState<number | null>(
      null
    );

  const [tick, setTick] =
    useState(
      Date.now()
    );

  const [expanded, setExpanded] =
    useState<number | null>(
      null
    );

  const [checks, setChecks] =
    useState<
      Record<
        number,
        {
          cross: boolean;
          sticker: boolean;
          packaging: boolean;
        }
      >
    >({});

  const loadOrders =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/processing/orders",
              {
                cache:
                  "no-store",
                credentials:
                  "include",
              }
            );

          const data: ApiResponse =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Processing session expired"
            );
          }

          setOrders(
            data.orders ||
              []
          );

          if (
            data.currentStaff
          ) {
            setStaff(
              data.currentStaff
            );
          }

          setError("");
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load orders"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(
    () => {
      loadOrders();

      const refresh =
        window.setInterval(
          loadOrders,
          10000
        );

      const clock =
        window.setInterval(
          () =>
            setTick(
              Date.now()
            ),
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
    },
    [loadOrders]
  );

  async function action(
    orderId: number,
    actionName: string,
    extra: any = {}
  ) {
    try {
      setBusyOrder(
        orderId
      );

      setError("");

      const response =
        await fetch(
          "/api/processing/orders",
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify({
              id: orderId,
              action:
                actionName,
              ...extra,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Action failed"
        );
      }

      await loadOrders();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Action failed"
      );
    } finally {
      setBusyOrder(
        null
      );
    }
  }

  async function packItem(
    orderId: number,
    itemId: number,
    packed: boolean
  ) {
    try {
      setBusyItem(
        itemId
      );

      setOrders(
        (current) =>
          current.map(
            (order) =>
              order.id !==
              orderId
                ? order
                : {
                    ...order,
                    items:
                      order.items.map(
                        (item) =>
                          item.id !==
                          itemId
                            ? item
                            : {
                                ...item,
                                packed,
                              }
                      ),
                  }
          )
      );

      const response =
        await fetch(
          "/api/processing/orders",
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify({
              id: orderId,
              action:
                "packItem",
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Packing update failed"
      );

      await loadOrders();
    } finally {
      setBusyItem(
        null
      );
    }
  }

  async function logout() {
    await fetch(
      "/api/auth/logout",
      {
        method:
          "POST",
      }
    );

    window.location.href =
      "/processing/login";
  }

  const newCount =
    orders.filter(
      (o) =>
        [
          "Pending",
          "Confirmed",
          "Paid",
          "Payment Received",
        ].includes(
          o.status
        )
    ).length;

  const processingCount =
    orders.filter(
      (o) =>
        o.status ===
        "Processing"
    ).length;

  const readyCount =
    orders.filter(
      (o) =>
        o.status ===
        "Ready For Dispatch"
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-3 md:p-6">

      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Fresh2Cook Operations
            </div>

            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Processing Team
            </h1>

            <p className="text-xs text-slate-500">
              {staff
                ? `Logged in: ${staff.name}`
                : "Processing Staff"}
            </p>
          </div>

          <button
            onClick={
              logout
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            Logout
          </button>

        </div>


        {/* STATS */}

        <div className="mb-5 grid grid-cols-3 gap-2 md:gap-4">

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <div className="text-[11px] font-bold text-emerald-700">
              NEW
            </div>
            <div className="text-2xl font-black text-slate-900">
              {newCount}
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
            <div className="text-[11px] font-bold text-orange-700">
              PROCESSING
            </div>
            <div className="text-2xl font-black text-slate-900">
              {processingCount}
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="text-[11px] font-bold text-blue-700">
              DISPATCH
            </div>
            <div className="text-2xl font-black text-slate-900">
              {readyCount}
            </div>
          </div>

        </div>


        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}


        {/* QUEUE */}

        <div className="space-y-3">

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500">
              Loading processing queue...
            </div>
          ) : (
            orders.map(
              (order) => {

                const accepted =
                  !!order.processingAcceptedById;

                const mine =
                  order.processingAcceptedById ===
                  staff?.id;

                const allPacked =
                  order.items.length >
                    0 &&
                  order.items.every(
                    (item) =>
                      item.packed
                  );

                const prepared =
                  !!order.processingPreparedAt;

                const cross =
                  !!order.processingCrossCheckedAt;

                const sticker =
                  !!order.processingStickerAt;

                const packaging =
                  !!order.processingPackagingAt;

                const step4Ready =
                  prepared &&
                  cross &&
                  sticker &&
                  packaging;

                const isProcessing =
                  order.status ===
                  "Processing";

                const isReady =
                  order.status ===
                  "Ready For Dispatch";

                return (

                  <div
                    key={
                      order.id
                    }
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* ORDER TOP ROW */}

                    <div className="grid items-center gap-3 border-b border-slate-100 bg-slate-50 px-3 py-3 md:grid-cols-[90px_1fr_140px_150px_130px]">

                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Order
                        </div>

                        <div className="text-base font-black text-slate-900">
                          #{order.id}
                        </div>
                      </div>


                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {order.customer}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {order.phone ||
                            "-"}
                        </div>
                      </div>


                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Value
                        </div>

                        <div className="font-black text-slate-800">
                          {money(
                            order.amount
                          )}
                        </div>
                      </div>


                      <div>
                        {!accepted ? (
                          <label className="flex cursor-pointer items-center gap-2 text-sm font-black text-emerald-700">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() =>
                                action(
                                  order.id,
                                  "accept"
                                )
                              }
                              disabled={
                                busyOrder ===
                                order.id
                              }
                              className="h-5 w-5 accent-emerald-600"
                            />

                            ACCEPT
                          </label>
                        ) : (
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Accepted By
                            </div>

                            <div className="text-sm font-black text-emerald-700">
                              {
                                order.acceptedByName
                              }
                            </div>
                          </div>
                        )}
                      </div>


                      <div className="text-right">

                        {isProcessing ? (
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              SLA
                            </div>

                            <div
                              className={`font-mono text-lg font-black ${
                                new Date(
                                  order.processingDeadline ||
                                    0
                                ).getTime() <
                                tick
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {timer(
                                order.processingDeadline
                              )}
                            </div>
                          </div>
                        ) : isReady ? (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-700">
                            READY
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                            {order.status}
                          </span>
                        )}

                      </div>

                    </div>


                    {/* STEPS */}

                    <div className="grid grid-cols-2 border-b border-slate-100 md:grid-cols-4">

                      {/* STEP 1 */}

                      <div
                        className={`border-r border-b p-3 md:border-b-0 ${
                          accepted
                            ? "bg-emerald-50"
                            : "bg-white"
                        }`}
                      >

                        <div className="text-[10px] font-black uppercase text-slate-400">
                          Step 1
                        </div>

                        <div className="mt-1 flex items-center gap-2">

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              accepted
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {accepted
                              ? "Ã¢Å“â€œ"
                              : "1"}
                          </span>

                          <div>
                            <div className="text-xs font-black">
                              Accept
                            </div>

                            {order.acceptedByName && (
                              <div className="text-[10px] text-slate-500">
                                {
                                  order.acceptedByName
                                }{" "}
                                Ã¢â‚¬Â¢{" "}
                                {timeText(
                                  order.processingAcceptedAt
                                )}
                              </div>
                            )}
                          </div>

                        </div>

                      </div>


                      {/* STEP 2 */}

                      <div
                        className={`border-r border-b p-3 md:border-b-0 ${
                          prepared
                            ? "bg-emerald-50"
                            : "bg-white"
                        }`}
                      >

                        <div className="text-[10px] font-black uppercase text-slate-400">
                          Step 2
                        </div>

                        <label className="mt-1 flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={
                              prepared
                            }
                            disabled={
                              !mine ||
                              !allPacked ||
                              !!prepared
                            }
                            onChange={() =>
                              action(
                                order.id,
                                "prepare"
                              )
                            }
                            className="h-5 w-5 accent-emerald-600"
                          />

                          <span className="text-xs font-black">
                            Prepare & Pack
                          </span>

                        </label>

                      </div>


                      {/* STEP 3 */}

                      <div
                        className={`border-r border-b p-3 md:border-b-0 ${
                          step4Ready
                            ? "bg-emerald-50"
                            : "bg-white"
                        }`}
                      >

                        <div className="text-[10px] font-black uppercase text-slate-400">
                          Step 3
                        </div>

                        <div className="mt-1 space-y-1">

                          <label className="flex items-center gap-2 text-[11px] font-bold">
                            <input
                              type="checkbox"
                              checked={
                                !!checks[
                                  order.id
                                ]?.cross ||
                                cross
                              }
                              disabled={
                                !mine ||
                                !prepared ||
                                cross
                              }
                              onChange={(e) =>
                                setChecks(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [order.id]:
                                      {
                                        cross:
                                          e
                                            .target
                                            .checked,
                                        sticker:
                                          !!current[
                                            order.id
                                          ]?.sticker,
                                        packaging:
                                          !!current[
                                            order.id
                                          ]?.packaging,
                                      },
                                  })
                                )
                              }
                              className="h-4 w-4 accent-emerald-600"
                            />
                            Qty / Product Check
                          </label>

                          <label className="flex items-center gap-2 text-[11px] font-bold">
                            <input
                              type="checkbox"
                              checked={
                                !!checks[
                                  order.id
                                ]?.sticker ||
                                sticker
                              }
                              disabled={
                                !mine ||
                                !prepared ||
                                sticker
                              }
                              onChange={(e) =>
                                setChecks(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [order.id]:
                                      {
                                        cross:
                                          !!current[
                                            order.id
                                          ]?.cross,
                                        sticker:
                                          e
                                            .target
                                            .checked,
                                        packaging:
                                          !!current[
                                            order.id
                                          ]?.packaging,
                                      },
                                  })
                                )
                              }
                              className="h-4 w-4 accent-emerald-600"
                            />
                            Sticker / Label
                          </label>

                          <label className="flex items-center gap-2 text-[11px] font-bold">
                            <input
                              type="checkbox"
                              checked={
                                !!checks[
                                  order.id
                                ]?.packaging ||
                                packaging
                              }
                              disabled={
                                !mine ||
                                !prepared ||
                                packaging
                              }
                              onChange={(e) =>
                                setChecks(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [order.id]:
                                      {
                                        cross:
                                          !!current[
                                            order.id
                                          ]?.cross,
                                        sticker:
                                          !!current[
                                            order.id
                                          ]?.sticker,
                                        packaging:
                                          e
                                            .target
                                            .checked,
                                      },
                                  })
                                )
                              }
                              className="h-4 w-4 accent-emerald-600"
                            />
                            Packaging
                          </label>

                          {!cross &&
                            !sticker &&
                            !packaging &&
                            prepared &&
                            (() => {
                              const c =
                                checks[
                                  order.id
                                ];

                              if (
                                c?.cross &&
                                c?.sticker &&
                                c?.packaging
                              ) {
                                action(
                                  order.id,
                                  "crossCheck",
                                  {
                                    crossChecked:
                                      true,
                                    stickerChecked:
                                      true,
                                    packagingChecked:
                                      true,
                                  }
                                );
                              }

                              return null;
                            })()}

                        </div>

                      </div>


                      {/* STEP 4 */}

                      <div
                        className={`p-3 ${
                          isReady
                            ? "bg-blue-50"
                            : "bg-white"
                        }`}
                      >

                        <div className="text-[10px] font-black uppercase text-slate-400">
                          Step 4
                        </div>

                        {isReady ? (

                          <div className="mt-2 text-xs font-black text-blue-700">
                            Ã¢Å“â€œ SENT FOR DISPATCH
                          </div>

                        ) : (

                          <button
                            type="button"
                            disabled={
                              !mine ||
                              !step4Ready ||
                              busyOrder ===
                                order.id
                            }
                            onClick={() =>
                              action(
                                order.id,
                                "dispatch"
                              )
                            }
                            className={`mt-1 w-full rounded-lg px-3 py-2 text-xs font-black text-white ${
                              mine &&
                              step4Ready
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "cursor-not-allowed bg-slate-300"
                            }`}
                          >
                            Ã°Å¸Å¡Å¡ Send For Dispatch
                          </button>

                        )}

                      </div>

                    </div>


                    {/* PRODUCT GRID */}

                    <div className="border-t border-slate-100">

                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(
                            expanded ===
                              order.id
                              ? null
                              : order.id
                          )
                        }
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                      >

                        <div>
                          <span className="text-xs font-black text-slate-700">
                            Packing List
                          </span>

                          <span className="ml-2 text-[10px] text-slate-400">
                            {order.items.length} products
                          </span>
                        </div>

                        <span className="text-xs font-bold text-emerald-600">
                          {expanded ===
                          order.id
                            ? "Hide"
                            : "View"}
                        </span>

                      </button>


                      {expanded ===
                        order.id && (

                        <div className="overflow-x-auto px-3 pb-3">

                          <table className="w-full min-w-[700px] border-collapse text-xs">

                            <thead>

                              <tr className="bg-slate-900 text-white">

                                <th className="w-12 border border-slate-700 px-2 py-2 text-center">
                                  SR
                                </th>

                                <th className="border border-slate-700 px-3 py-2 text-left">
                                  PRODUCT
                                </th>

                                <th className="w-36 border border-slate-700 px-3 py-2 text-left">
                                  PACK / WEIGHT
                                </th>

                                <th className="w-16 border border-slate-700 px-2 py-2 text-center">
                                  QTY
                                </th>

                                <th className="w-28 border border-slate-700 px-3 py-2 text-right">
                                  AMOUNT
                                </th>

                                <th className="w-28 border border-slate-700 px-2 py-2 text-center">
                                  PACKED
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {order.items.map(
                                (
                                  item,
                                  index
                                ) => (

                                  <tr
                                    key={
                                      item.id
                                    }
                                    className={
                                      item.packed
                                        ? "bg-emerald-50"
                                        : "bg-white"
                                    }
                                  >

                                    <td className="border border-slate-200 px-2 py-3 text-center font-bold text-slate-400">
                                      {
                                        index +
                                        1
                                      }
                                    </td>

                                    <td className="border border-slate-200 px-3 py-3 font-black text-slate-800">
                                      {
                                        item.productName
                                      }
                                    </td>

                                    <td className="border border-slate-200 px-3 py-3 font-semibold text-slate-600">
                                      {
                                        item.pack
                                      }
                                    </td>

                                    <td className="border border-slate-200 px-2 py-3 text-center font-black">
                                      {
                                        item.quantity
                                      }
                                    </td>

                                    <td className="border border-slate-200 px-3 py-3 text-right font-bold">
                                      {money(
                                        item.total
                                      )}
                                    </td>

                                    <td className="border border-slate-200 px-2 py-3 text-center">

                                      <input
                                        type="checkbox"
                                        checked={
                                          item.packed
                                        }
                                        disabled={
                                          !mine ||
                                          busyItem ===
                                            item.id ||
                                          prepared
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          packItem(
                                            order.id,
                                            item.id,
                                            e
                                              .target
                                              .checked
                                          )
                                        }
                                        className="h-5 w-5 accent-emerald-600"
                                      />

                                    </td>

                                  </tr>

                                )
                              )}

                            </tbody>

                          </table>

                        </div>

                      )}

                    </div>

                  </div>

                );
              }
            )
          )}

        </div>

      </div>

    </main>
  );
}





