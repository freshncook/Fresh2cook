"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryManagementPage() {
  const [orders, setOrders] =
    useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-orders"
      ) || "[]"
    );

    setOrders(data);
  }

  function assignRider(
    id: number,
    rider: string
  ) {
    const updated =
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              rider,
            }
          : order
      );

    localStorage.setItem(
      "freshcut-orders",
      JSON.stringify(updated)
    );

    setOrders(updated);
  }

  function updateStatus(
    id: number,
    status: string
  ) {
    const updated =
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      );

    localStorage.setItem(
      "freshcut-orders",
      JSON.stringify(updated)
    );

    setOrders(updated);
  }

  const pendingDeliveries =
    orders.filter(
      (o) =>
        o.status !==
        "Delivered"
    ).length;

  const deliveredOrders =
    orders.filter(
      (o) =>
        o.status ===
        "Delivered"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Delivery Management
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-yellow-50 rounded-xl p-6">

            <h2 className="text-2xl font-bold">
              Pending Deliveries
            </h2>

            <div className="text-5xl font-bold text-yellow-600 mt-3">
              {pendingDeliveries}
            </div>

          </div>

          <div className="bg-green-50 rounded-xl p-6">

            <h2 className="text-2xl font-bold">
              Delivered Orders
            </h2>

            <div className="text-5xl font-bold text-green-600 mt-3">
              {deliveredOrders}
            </div>

          </div>

        </div>

        <div className="space-y-5">

          {orders.map(
            (order) => (

              <div
                key={order.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex justify-between">

                  <div>

                    <h2 className="text-xl font-bold">
                      FC-{order.id}
                    </h2>

                    <p>
                      {order.customer}
                    </p>

                    <p>
                      {order.phone}
                    </p>

                    <p>
                      {order.address}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-bold text-green-600">
                      Ã¢â€šÂ¹{order.total}
                    </p>

                    <p>
                      {order.status}
                    </p>

                  </div>

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">

                  <input
                    type="text"
                    value={
                      order.rider || ""
                    }
                    onChange={(e) =>
                      assignRider(
                        order.id,
                        e.target.value
                      )
                    }
                    placeholder="Delivery Rider Name"
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={
                      order.status ||
                      "Pending"
                    }
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className="border p-3 rounded-xl"
                  >
                    <option>
                      Pending
                    </option>
                    <option>
                      Packed
                    </option>
                    <option>
                      Out For Delivery
                    </option>
                    <option>
                      Delivered
                    </option>
                  </select>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}








