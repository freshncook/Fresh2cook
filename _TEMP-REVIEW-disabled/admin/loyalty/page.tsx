"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function LoyaltyPage() {
  const [customers, setCustomers] =
    useState<any[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    const orders = JSON.parse(
      localStorage.getItem(
        "freshcut-orders"
      ) || "[]"
    );

    const customerMap: any = {};

    orders.forEach(
      (order: any) => {
        const phone =
          order.phone;

        if (
          !customerMap[phone]
        ) {
          customerMap[phone] = {
            customer:
              order.customer,
            phone:
              order.phone,
            orders: 0,
            spend: 0,
            points: 0,
          };
        }

        customerMap[
          phone
        ].orders += 1;

        customerMap[
          phone
        ].spend += Number(
          order.total || 0
        );

        customerMap[
          phone
        ].points =
          Math.floor(
            customerMap[
              phone
            ].spend / 100
          );
      }
    );

    setCustomers(
      Object.values(
        customerMap
      )
    );
  }

  function redeemPoints(
    phone: string
  ) {
    const updated =
      customers.map(
        (customer: any) =>
          customer.phone ===
          phone
            ? {
                ...customer,
                points: 0,
              }
            : customer
      );

    setCustomers(updated);

    alert(
      "Points Redeemed Successfully"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Loyalty Program
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {customers.map(
            (
              customer: any,
              index
            ) => (

              <div
                key={index}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {
                    customer.customer
                  }
                </h2>

                <p className="mt-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¾{" "}
                  {
                    customer.phone
                  }
                </p>

                <div className="mt-5">

                  <div className="bg-blue-50 rounded-xl p-3 mb-3">

                    Orders:
                    {" "}
                    <strong>
                      {
                        customer.orders
                      }
                    </strong>

                  </div>

                  <div className="bg-green-50 rounded-xl p-3 mb-3">

                    Spend:
                    {" "}
                    <strong>
                      Ã¢â€šÂ¹
                      {
                        customer.spend
                      }
                    </strong>

                  </div>

                  <div className="bg-yellow-50 rounded-xl p-3">

                    Reward Points:
                    {" "}
                    <strong>
                      {
                        customer.points
                      }
                    </strong>

                  </div>

                </div>

                <button
                  onClick={() =>
                    redeemPoints(
                      customer.phone
                    )
                  }
                  className="w-full mt-5 bg-green-600 text-white py-3 rounded-xl font-bold"
                >
                  Redeem Points
                </button>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}








