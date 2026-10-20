"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryRatingsPage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadRiders();
  }, []);

  async function loadRiders() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/delivery-boys"
      );

      const data =
        await res.json();

      setRiders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getPriorityScore(
    rider: any
  ) {
    const rating =
      rider.rating || 5;

    const completed =
      rider.completedDeliveries ||
      0;

    const score =
      rating * 20 +
      completed;

    return Math.round(score);
  }

  const totalRiders =
    riders.length;

  const onlineRiders =
    riders.filter(
      (r) =>
        r.status === "Online"
    ).length;

  const topRider =
    riders.length > 0
      ? [...riders].sort(
          (a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        )[0]
      : null;

  const totalDeliveries =
    riders.reduce(
      (sum, rider) =>
        sum +
        (rider.completedDeliveries ||
          0),
      0
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">
            Delivery Ratings
          </h1>

          <button
            onClick={
              loadRiders
            }
            className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold"
          >
            Refresh
          </button>

        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Riders
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalRiders}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Online Riders
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-2">
              {onlineRiders}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Deliveries
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              {totalDeliveries}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Top Rider
            </p>

            <h2 className="text-xl font-bold text-purple-600 mt-2">
              {topRider?.name ||
                "-"}
            </h2>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-2xl font-bold">
              Rider Performance
            </h2>

          </div>

          {loading ? (
            <div className="p-10 text-center">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-gray-50">

                    <th className="p-4 text-left">
                      Rider
                    </th>

                    <th className="p-4 text-left">
                      Mobile
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-left">
                      Rating
                    </th>

                    <th className="p-4 text-left">
                      Deliveries
                    </th>

                    <th className="p-4 text-left">
                      Earnings
                    </th>

                    <th className="p-4 text-left">
                      Priority
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {riders.map(
                    (
                      rider
                    ) => (
                      <tr
                        key={
                          rider.id
                        }
                        className="border-b"
                      >

                        <td className="p-4">

                          <div className="font-bold">
                            {
                              rider.name
                            }
                          </div>

                        </td>

                        <td className="p-4">
                          {
                            rider.mobile
                          }
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              rider.status ===
                              "Online"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-50 text-gray-700"
                            }`}
                          >
                            {
                              rider.status
                            }
                          </span>

                        </td>

                        <td className="p-4 font-bold text-orange-600">
                          ⭐{" "}
                          {(
                            rider.rating ||
                            5
                          ).toFixed(
                            1
                          )}
                        </td>

                        <td className="p-4 font-bold text-blue-600">
                          {
                            rider.completedDeliveries
                          }
                        </td>

                        <td className="p-4 font-bold text-green-600">
                          ₹
                          {rider.earnings ||
                            0}
                        </td>

                        <td className="p-4">

                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">

                            {getPriorityScore(
                              rider
                            )}

                          </span>

                        </td>

                      </tr>
                    )
                  )}

                  {riders.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={
                          7
                        }
                        className="text-center p-10 text-gray-500"
                      >
                        No Riders Found
                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}









