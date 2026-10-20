"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useState,
} from "react";

export default function DispatchCenterPage() {
  const [orders,
    setOrders] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res =
        await fetch(
          "/api/admin-order-board"
        );

      const data =
        await res.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (
      error
    ) {
      console.error(
        error
      );
    }
  }

  async function dispatchOrder(
    order: any
  ) {
    setLoading(true);

    try {
      const res =
        await fetch(
          "/api/admin-auto-dispatch",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                orderId:
                  order.id,

                latitude:
                  28.6139,

                longitude:
                  77.209,
              }
            ),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error
        );
        return;
      }

      alert(
        `Assigned To ${data.rider.name}
Distance : ${data.distance} KM`
      );

      loadOrders();
    } catch (
      error
    ) {
      console.error(
        error
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <div className="p-6">

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Smart Dispatch Center
        </h1>

        <p className="text-gray-500">
          Nearest Rider Auto Assignment
        </p>

      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-4 text-left">
                Order
              </th>

              <th className="p-4 text-left">
                Customer
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {orders.map(
              (
                order
              ) => (
                <tr
                  key={
                    order.id
                  }
                  className="border-t"
                >

                  <td className="p-4">
                    #
                    {
                      order.id
                    }
                  </td>

                  <td className="p-4">
                    {
                      order.customer
                    }
                  </td>

                  <td className="p-4">
                    Ã¢â€šÂ¹
                    {
                      order.amount
                    }
                  </td>

                  <td className="p-4">
                    {
                      order.status
                    }
                  </td>

                  <td className="p-4">

                    <button
                      disabled={
                        loading
                      }
                      onClick={() =>
                        dispatchOrder(
                          order
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Auto Dispatch
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}






