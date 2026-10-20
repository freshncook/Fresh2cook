"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

export default function ManualAssignmentPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, ridersRes] =
        await Promise.all([
          fetch("/api/processing/orders"),
          fetch("/api/delivery-live-status"),
        ]);

      const ordersData =
        await ordersRes.json();

      const ridersData =
        await ridersRes.json();

      const pendingOrders = Array.isArray(
        ordersData
      )
        ? ordersData
        : ordersData.orders || [];

      const availableRiders =
        Array.isArray(ridersData)
          ? ridersData
          : ridersData.riders || [];

      pendingOrders.sort(
        (a: any, b: any) =>
          Number(b.id) - Number(a.id)
      );

      setOrders(pendingOrders);
      setRiders(availableRiders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function extractSector(
    address: string
  ) {
    if (!address) return "";

    const text =
      address.toLowerCase();

    const match =
      text.match(
        /dwarka[\s\-]*([0-9]+)/i
      );

    return match
      ? match[1]
      : "";
  }

  function riderScore(
    rider: any,
    order: any
  ) {
    let score = 100;

    const sector =
      extractSector(
        order?.address || ""
      );

    const zone =
      String(
        rider?.zoneId || ""
      );

    if (
      sector &&
      zone.includes(sector)
    ) {
      score += 80;
    }

    const activeOrders =
      Number(
        rider?.activeOrders || 0
      );

    score -= activeOrders * 15;

    if (
      rider?.status ===
      "Available"
    ) {
      score += 30;
    }

    score += Number(
      rider?.rating || 5
    );

    return score;
  }

  async function assignOrder(
    orderId: number,
    riderId: number
  ) {
    try {
      setAssigning(orderId);

      const response =
        await fetch(
          "/api/delivery-auto-assign",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId,
              riderId,
              manual: true,
            }),
          }
        );

      const data =
        await response.json();

      if (!data.success) {
        alert(
          data.error ||
            "Assignment Failed"
        );
        return;
      }

      await loadData();

      alert(
        "Order Assigned Successfully"
      );
    } catch (error) {
      console.error(error);

      alert("Assignment Failed");
    } finally {
      setAssigning(null);
    }
  }

  const pendingOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          ![
            "Delivered",
            "Cancelled",
          ].includes(
            String(
              order.status
            )
          )
      );
    }, [orders]);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Manual Assignment
          </h1>

          <p className="text-gray-500">
            New Orders First
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Refresh
        </button>

      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-xl">
          Loading...
        </div>
      ) : pendingOrders.length ===
        0 ? (
        <div className="bg-white p-8 rounded-xl">
          No Pending Orders
        </div>
      ) : (
        <div className="space-y-5">

          {pendingOrders.map(
            (order) => {

              const sortedRiders =
                [...riders].sort(
                  (a, b) =>
                    riderScore(
                      b,
                      order
                    ) -
                    riderScore(
                      a,
                      order
                    )
                );

              return (
                <div
                  key={order.id}
                  className="bg-white border rounded-2xl p-5 shadow"
                >

                  <div className="mb-4">

                    <div className="flex justify-between">

                      <h2 className="font-bold text-lg">
                        Order #
                        {order.id}
                      </h2>

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                        New
                      </span>

                    </div>

                    <div className="mt-2 text-sm">
                      <div>
                        <strong>
                          Customer:
                        </strong>{" "}
                        {
                          order.customer
                        }
                      </div>

                      <div>
                        <strong>
                          Phone:
                        </strong>{" "}
                        {
                          order.phone
                        }
                      </div>

                      <div>
                        <strong>
                          Address:
                        </strong>{" "}
                        {
                          order.address
                        }
                      </div>

                    </div>

                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">

                    {sortedRiders.map(
                      (
                        rider,
                        index
                      ) => {

                        const activeOrders =
                          Number(
                            rider?.activeOrders ||
                              0
                          );

                        const full =
                          activeOrders >=
                          5;

                        const score =
                          riderScore(
                            rider,
                            order
                          );

                        return (
                          <div
                            key={
                              rider.id
                            }
                            className={`border rounded-xl p-4 ${
                              index ===
                              0
                                ? "border-green-500 bg-green-50"
                                : ""
                            }`}
                          >

                            <div className="font-bold">
                              {
                                rider.name
                              }
                            </div>

                            <div className="text-sm text-gray-500">
                              {
                                rider.mobile
                              }
                            </div>

                            <div className="mt-2 text-sm">
                              Score:{" "}
                              <strong>
                                {score}
                              </strong>
                            </div>

                            <div className="text-sm">
                              Active Orders:{" "}
                              {
                                activeOrders
                              }
                            </div>

                            <div className="text-sm">
                              Status:{" "}
                              {
                                rider.status
                              }
                            </div>

                            <div className="text-sm">
                              Zone:{" "}
                              {String(
                                rider.zoneId ||
                                  "-"
                              )}
                            </div>

                            {index ===
                              0 && (
                              <div className="mt-2 text-green-700 text-xs font-bold">
                                BEST MATCH
                              </div>
                            )}

                            <button
                              disabled={
                                full ||
                                assigning ===
                                  order.id
                              }
                              onClick={() =>
                                assignOrder(
                                  order.id,
                                  rider.id
                                )
                              }
                              className={`w-full mt-3 py-2 rounded-xl text-white ${
                                full
                                  ? "bg-gray-400"
                                  : "bg-blue-600"
                              }`}
                            >
                              {full
                                ? "Capacity Full"
                                : assigning ===
                                  order.id
                                ? "Assigning..."
                                : "Assign Rider"}
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

