"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryPerformancePage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-performance"
        );

      const data =
        await res.json();

      setRiders(
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

  const totalRiders =
    riders.length;

  const totalDeliveries =
    riders.reduce(
      (
        sum,
        rider
      ) =>
        sum +
        rider.completed,
      0
    );

  const totalEarnings =
    riders.reduce(
      (
        sum,
        rider
      ) =>
        sum +
        rider.earnings,
      0
    );

  const activeRiders =
    riders.filter(
      (
        rider
      ) =>
        rider.status ===
        "Online" ||
        rider.status ===
        "On Delivery"
    ).length;

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Delivery Performance
        </h1>

        <p className="text-gray-500 mt-1">
          Rider Leaderboard &
          Analytics
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-5">

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-gray-500">
            Total Riders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalRiders}
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-gray-500">
            Deliveries
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalDeliveries}
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-gray-500">
            Total Earnings
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            ₹{totalEarnings}
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-gray-500">
            Active Riders
          </p>

          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {activeRiders}
          </h2>

        </div>

      </div>

      <div className="bg-white rounded-2xl border shadow-md overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Rider Leaderboard
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left p-4">
                  Rank
                </th>

                <th className="text-left p-4">
                  Rider
                </th>

                <th className="text-left p-4">
                  Rating
                </th>

                <th className="text-left p-4">
                  Deliveries
                </th>

                <th className="text-left p-4">
                  Pending
                </th>

                <th className="text-left p-4">
                  Earnings
                </th>

                <th className="text-left p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {riders.map(
                (
                  rider,
                  index
                ) => (
                  <tr
                    key={
                      rider.id
                    }
                    className="border-t"
                  >

                    <td className="p-4 font-bold">
                      #{index + 1}
                    </td>

                    <td className="p-4">

                      <div>
                        <div className="font-semibold">
                          {
                            rider.name
                          }
                        </div>

                        <div className="text-sm text-gray-500">
                          {
                            rider.mobile
                          }
                        </div>
                      </div>

                    </td>

                    <td className="p-4">
                      ⭐
                      {
                        rider.rating
                      }
                    </td>

                    <td className="p-4">
                      {
                        rider.completed
                      }
                    </td>

                    <td className="p-4">
                      {
                        rider.pending
                      }
                    </td>

                    <td className="p-4 text-green-600 font-semibold">
                      ₹
                      {
                        rider.earnings
                      }
                    </td>

                    <td className="p-4">

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        {
                          rider.status
                        }
                      </span>

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









