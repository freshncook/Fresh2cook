"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryOrdersPage() {
  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-orders"
        );

      const data =
        await res.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function reassignOrder(
    assignmentId: number
  ) {
    try {
      const res =
        await fetch(
          "/api/delivery-auto-reassign",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              assignmentId,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Reassign Failed"
        );
        return;
      }

      alert(
        "Order Reassigned Successfully"
      );

      loadOrders();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Delivery Orders
        </h1>

        <p className="text-gray-500 mt-1">
          Delivery Control Center
        </p>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <h2 className="text-2xl font-bold">
            {orders.length}
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h2 className="text-2xl font-bold text-orange-600">
            {
              orders.filter(
                (o) =>
                  o.status ===
                  "Pending Acceptance"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Accepted
          </p>

          <h2 className="text-2xl font-bold text-sky-600">
            {
              orders.filter(
                (o) =>
                  o.status ===
                  "Accepted"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Picked Up
          </p>

          <h2 className="text-2xl font-bold text-indigo-600">
            {
              orders.filter(
                (o) =>
                  o.status ===
                  "Picked Up"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Out For Delivery
          </p>

          <h2 className="text-2xl font-bold text-purple-600">
            {
              orders.filter(
                (o) =>
                  o.status ===
                  "Out For Delivery"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Delivered
          </p>

          <h2 className="text-2xl font-bold text-green-600">
            {
              orders.filter(
                (o) =>
                  o.status ===
                  "Delivered"
              ).length
            }
          </h2>
        </div>

      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left p-4">
                  Order
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Phone
                </th>

                <th className="text-left p-4">
                  Rider
                </th>

                <th className="text-left p-4">
                  OTP
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map(
                (item: any) => (

                  <tr
                    key={item.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      #{item.orderId}
                    </td>

                    <td className="p-4">
                      {
                        item.order
                          ?.customer
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.order
                          ?.phone
                      }
                    </td>

                    <td className="p-4">

                      <div>
                        {
                          item.rider
                            ?.name
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        {
                          item.rider
                            ?.mobile
                        }
                      </div>

                    </td>

                    <td className="p-4 font-bold">
                      {item.otp}
                    </td>

                    <td className="p-4">

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        {item.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex gap-2 flex-wrap">

                        {item.rider
                          ?.latitude &&
                          item.rider
                            ?.longitude && (

                          <a
                            href={`https://www.google.com/maps?q=${item.rider.latitude},${item.rider.longitude}`}
                            target="_blank"
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Track
                          </a>

                        )}

                        <button
                          onClick={() =>
                            reassignOrder(
                              item.id
                            )
                          }
                          className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Reassign
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}






