"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {

  const [orders,setOrders] =
    useState<any[]>([]);

  const [loading,setLoading] =
    useState(true);

  async function loadOrders() {

    try {

      const phone =
        localStorage.getItem(
          "freshcut-phone"
        ) || "";

      if(!phone){
        setLoading(false);
        return;
      }

      const res =
        await fetch(
          `/api/customer-orders?phone=${phone}`,
          {
            cache:"no-store"
          }
        );

      const data =
        await res.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch {

      setOrders([]);

    } finally {

      setLoading(false);

    }
  }

  useEffect(()=>{
    loadOrders();
  },[]);

  return (
    <div className="max-w-6xl mx-auto p-4">

      <h1 className="text-3xl font-bold mb-6">
        My Orders
      </h1>

      {loading && (
        <div className="rounded-xl border p-4">
          Loading...
        </div>
      )}

      {!loading &&
        orders.length===0 && (
        <div className="rounded-xl border p-4">
          No Orders Found
        </div>
      )}

      <div className="space-y-4">

        {orders.map((order:any)=>(

          <div
            key={order.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >

            <div className="flex justify-between">

              <div>

                <div className="font-bold">
                  Order #{order.id}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(
                    order.createdAt
                  ).toLocaleString()}
                </div>

              </div>

              <div className="font-semibold text-green-600">
                {order.status}
              </div>

            </div>

            <div className="mt-3">

              <div>
                Customer:
                {" "}
                {order.customer}
              </div>

              <div>
                Amount:
                {" "}
                ₹{order.amount}
              </div>

            </div>

            <div className="mt-4 flex gap-2">

              <a
                href={`/order-timeline?id=${order.id}`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Track Order
              </a>

              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
                onClick={async()=>{

                  if(
                    !confirm(
                      "Cancel this order?"
                    )
                  ){
                    return;
                  }

                  await fetch(
                    "/api/orders/cancel",
                    {
                      method:"POST",
                      headers:{
                        "Content-Type":"application/json"
                      },
                      body:JSON.stringify({
                        orderId:order.id
                      })
                    }
                  );

                  window.location.reload();

                }}
              >
                Cancel Order
              </button>

              <button
  className="rounded-lg bg-green-600 px-4 py-2 text-white"
  onClick={async ()=>{
                  localStorage.setItem(
                    "reorder-id",
                    String(order.id)
                  );

                  const res = await fetch(
  "/api/orders/reorder",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId: order.id,
    }),
  }
);

const data = await res.json();

if (data.success) {
  alert(
    "Order Recreated Successfully"
  );

  window.location.reload();
}
                }}
              >
                Reorder
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}




