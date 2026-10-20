"use client";

import { useEffect, useMemo, useState } from "react";

export default function DispatchBoardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch(
        "/api/fleet-dispatch-board",
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(
      loadData,
      10000
    );

    return () =>
      clearInterval(timer);
  }, []);

  const orders =
    data?.orders ||
    data?.dispatchOrders ||
    data?.items ||
    [];

  const riders =
    data?.riders ||
    [];

  function extractSector(
    address: string = ""
  ) {
    const text =
      address.toLowerCase();

    const match =
      text.match(
        /sector[\s\-]*(\d+)/i
      );

    if (match?.[1]) {
      return `Sector ${match[1]}`;
    }

    const dwarkaMatch =
      text.match(
        /dwarka[\s\-]*(\d+)/i
      );

    if (dwarkaMatch?.[1]) {
      return `Sector ${dwarkaMatch[1]}`;
    }

    return "Other";
  }

  function extractSociety(
    address: string = ""
  ) {
    const lines =
      address
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    if (lines.length >= 2) {
      return lines[0];
    }

    return "General";
  }

  const groupedOrders =
    useMemo(() => {
      const groups: Record<
        string,
        any[]
      > = {};

      orders.forEach(
        (order: any) => {
          const sector =
            extractSector(
              order.address
            );

          if (
            !groups[sector]
          ) {
            groups[sector] =
              [];
          }

          groups[sector].push(
            order
          );
        }
      );

      return groups;
    }, [orders]);

  const pendingCount =
    orders.length;

  const assignedCount =
    orders.filter(
      (x: any) =>
        x.status ===
        "Assigned"
    ).length;

  const pickedCount =
    orders.filter(
      (x: any) =>
        x.status ===
        "Picked Up"
    ).length;

  const deliveredCount =
    orders.filter(
      (x: any) =>
        x.status ===
        "Delivered"
    ).length;

  return (
    <div className="p-4">

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">

        <div className="rounded-xl bg-yellow-50 border p-3 text-center">
          <div className="text-xs">
            Pending
          </div>
          <div className="text-xl font-bold">
            {pendingCount}
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border p-3 text-center">
          <div className="text-xs">
            Assigned
          </div>
          <div className="text-xl font-bold">
            {assignedCount}
          </div>
        </div>

        <div className="rounded-xl bg-purple-50 border p-3 text-center">
          <div className="text-xs">
            Picked
          </div>
          <div className="text-xl font-bold">
            {pickedCount}
          </div>
        </div>

        <div className="rounded-xl bg-green-50 border p-3 text-center">
          <div className="text-xs">
            Delivered
          </div>
          <div className="text-xl font-bold">
            {deliveredCount}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border p-3 text-center">
          <div className="text-xs">
            Riders
          </div>
          <div className="text-xl font-bold">
            {riders.length}
          </div>
        </div>

      </div>

      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Dispatch Board
          </h1>

          <p className="text-sm text-gray-500">
            Sector Wise Dispatch
          </p>
        </div>

        <button
          onClick={loadData}
          className="rounded-xl bg-green-600 px-4 py-2 text-white"
        >
          Refresh
        </button>

      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-4">
          Loading...
        </div>
      ) : (
        <div className="grid xl:grid-cols-4 gap-4">

          {/* ORDERS */}

          <div className="xl:col-span-3">

            {Object.entries(
              groupedOrders
            ).map(
              (
                [sector, sectorOrders]: any
              ) => (
                <div
                  key={sector}
                  className="mb-5"
                >
                  <div className="mb-2 rounded-xl border bg-slate-100 p-3 font-bold">
                    {sector} •{" "}
                    {
                      sectorOrders.length
                    }{" "}
                    Orders
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">

                    {sectorOrders.map(
                      (
                        order: any
                      ) => {
                        const society =
                          extractSociety(
                            order.address
                          );

                        const recommended =
                          riders
                            .slice()
                            .sort(
                              (
                                a: any,
                                b: any
                              ) =>
                                (
                                  a.activeOrders ||
                                  0
                                ) -
                                (
                                  b.activeOrders ||
                                  0
                                )
                            )[0];

                        return (
                          <div
                            key={
                              order.id
                            }
                            className="rounded-xl border bg-white p-3 shadow-sm"
                          >
                            <div className="flex justify-between">
                              <div className="font-bold">
                                #
                                {
                                  order.id
                                }
                              </div>

                              <div className="rounded bg-yellow-100 px-2 py-1 text-xs">
                                {
                                  order.status
                                }
                              </div>
                            </div>

                            <div className="mt-2 font-medium">
                              {
                                order.customer
                              }
                            </div>

                            <div className="text-xs text-gray-500">
                              {
                                society
                              }
                            </div>

                            <div className="mt-2 text-sm">
                              ₹
                              {Number(
                                order.amount ||
                                  0
                              )}
                            </div>

                            <div className="mt-3 rounded-lg bg-green-50 border p-2">
                              <div className="text-xs font-semibold">
                                Recommended Rider
                              </div>

                              <div className="font-medium">
                                {recommended?.name ||
                                  "No Rider"}
                              </div>

                              <div className="text-xs text-gray-500">
                                Active Orders:{" "}
                                {recommended?.activeOrders ||
                                  0}

                              {order.recommendedRiders?.length > 0 && (
                                <div className="mt-2 space-y-1 text-xs">

                                  {order.recommendedRiders
                                    .slice(0,3)
                                    .map((r:any,index:number)=>( 

                                      <div
                                        key={r.id}
                                        className="flex justify-between rounded border bg-white px-2 py-1"
                                      >
                                        <span>
                                          #{index+1} {r.name}
                                        </span>

                                        <span>
                                          {r.score}
                                        </span>

                                      </div>

                                    ))}

                                </div>
                              )}

                              </div>
                            </div>
                              {order.recommendedRiders?.length > 0 && (
                                <div className="mt-2 space-y-1 text-xs">

                                  {order.recommendedRiders
                                    .slice(0,3)
                                    .map((r:any,index:number)=>(

                                      <div
                                        key={r.id}
                                        className="flex justify-between rounded border bg-white px-2 py-1"
                                      >
                                        <span>
                                          #{index+1} {r.name}
                                        </span>

                                        <span>
                                          {r.score}
                                        </span>

                                      </div>

                                    ))}
                                </div>
                              )}

                            <button
                              className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-white"
                              onClick={() => {
                                window.location.href =
                                  `/admin/manual-assignment?orderId=${order.id}`;
                              }}
                            >
                              Assign Rider
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )
            )}

          </div>

          {/* RIDERS */}

          <div>

            <div className="mb-3 font-semibold">
              Rider Load
            </div>

            <div className="space-y-2">

              {riders.map(
                (
                  rider: any
                ) => {
                  const active =
                    Number(
                      rider.activeOrders ||
                        0
                    );

                  return (
                    <div
                      key={
                        rider.id
                      }
                      className="rounded-xl border bg-white p-3"
                    >
                      <div className="font-semibold">
                        {
                          rider.name
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        {
                          rider.mobile
                        }
                      </div>

                      <div className="mt-2 flex justify-between">

                        <span>
                          Active
                        </span>

                        <span className="font-bold">
                          {active}
                        </span>

                      </div>

                      <div className="mt-2">

                        {active >=
                        5 ? (
                          <div className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 text-center">
                            OVERLOADED
                          </div>
                        ) : active >=
                          3 ? (
                          <div className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 text-center">
                            BUSY
                          </div>
                        ) : (
                          <div className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 text-center">
                            AVAILABLE
                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}






