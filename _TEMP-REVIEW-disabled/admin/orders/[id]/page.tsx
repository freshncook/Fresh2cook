"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<any[]>([]);

  const [boys, setBoys] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const ordersRes =
        await fetch("/api/orders");

      const boysRes =
        await fetch(
          "/api/delivery-boys"
        );

      const ordersData =
        await ordersRes.json();

      const boysData =
        await boysRes.json();

      setOrders(ordersData || []);
      setBoys(boysData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function assignOrder(
    orderId: number,
    riderId: number
  ) {
    try {
      const res = await fetch(
        "/api/delivery-control",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
            riderId,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Assignment Failed"
        );
        return;
      }

      alert(
        "Order Assigned Successfully"
      );

      loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Something Went Wrong"
      );
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
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl shadow p-6 mb-6">

          <h1 className="text-4xl font-bold">
            Orders Management
          </h1>

          <p className="text-gray-500 mt-2">
            Assign Orders To Delivery Riders
          </p>

        </div>

        <div className="grid gap-5">

          {orders.map(
            (order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow p-6"
              >
                <div className="flex justify-between items-start">

                  <div>

                    <h2 className="text-2xl font-bold">
                      Order #
                      {order.id}
                    </h2>

                    <p className="mt-2">
                      Customer :
                      {" "}
                      {
                        order.customer
                      }
                    </p>

                    <p>
                      Mobile :
                      {" "}
                      {
                        order.phone
                      }
                    </p>

                    <p>
                      Address :
                      {" "}
                      {
                        order.address
                      }
                    </p>

                    <p>
                      Amount :
                      {" "}
                      ₹
                      {
                        order.amount
                      }
                    </p>

                  </div>

                  <div>

                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full">
                      {
                        order.status
                      }
                    </span>

                  </div>

                </div>

                <div className="mt-6">

                  <label className="font-semibold">
                    Assign Delivery Boy
                  </label>

                  <select
                    className="w-full border p-3 rounded-xl mt-2"
                    onChange={(
                      e
                    ) =>
                      assignOrder(
                        order.id,
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                    defaultValue=""
                  >
                    <option value="">
                      Select Rider
                    </option>

                    {boys.map(
                      (
                        boy: any
                      ) => (
                        <option
                          key={
                            boy.id
                          }
                          value={
                            boy.id
                          }
                        >
                          {
                            boy.name
                          }
                          {" - "}
                          {
                            boy.mobile
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>
            )
          )}

          {orders.length ===
            0 && (
            <div className="bg-white rounded-3xl shadow p-10 text-center">

              <h2 className="text-2xl font-bold text-green-600">
                No Orders Found
              </h2>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}