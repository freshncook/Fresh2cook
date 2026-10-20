"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryControlPage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);

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

      alert(
        "Failed To Load Riders"
      );
    } finally {
      setLoading(false);
    }
  }

  async function autoAssignOrders() {
    try {
      setAssigning(true);

      const res =
        await fetch(
          "/api/delivery-smart-assign",
          {
            method: "POST",
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
        data.message
      );

      loadRiders();
    } catch (error) {
      console.error(error);

      alert(
        "Assignment Failed"
      );
    } finally {
      setAssigning(false);
    }
  }

  const onlineRiders =
    riders.filter(
      (r) =>
        r.status === "Online"
    ).length;

  const offlineRiders =
    riders.filter(
      (r) =>
        r.status !== "Online"
    ).length;

  const totalDeliveries =
    riders.reduce(
      (sum, rider) =>
        sum +
        (rider.completedDeliveries ||
          0),
      0
    );

  const totalEarnings =
    riders.reduce(
      (sum, rider) =>
        sum +
        (rider.earnings || 0),
      0
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">
            Delivery Control Center
          </h1>

          <div className="flex gap-5">

            <button
              onClick={
                loadRiders
              }
              className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold"
            >
              Refresh
            </button>

            <button
              onClick={
                autoAssignOrders
              }
              disabled={
                assigning
              }
              className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold"
            >
              {assigning
                ? "Assigning..."
                : "Auto Assign Orders"}
            </button>

          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Riders
            </p>

            <h2 className="text-4xl font-bold">
              {riders.length}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Online Riders
            </p>

            <h2 className="text-4xl font-bold text-green-600">
              {onlineRiders}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Offline Riders
            </p>

            <h2 className="text-4xl font-bold text-red-600">
              {offlineRiders}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Deliveries
            </p>

            <h2 className="text-4xl font-bold text-blue-600">
              {totalDeliveries}
            </h2>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Delivery Earnings
          </h2>

          <h3 className="text-5xl font-bold text-green-600">
            ₹{totalEarnings}
          </h3>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-2xl font-bold">
              Rider Status
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

                  </tr>

                </thead>

                <tbody>

                  {riders.map(
                    (rider) => (
                      <tr
                        key={
                          rider.id
                        }
                        className="border-b"
                      >

                        <td className="p-4 font-bold">
                          {
                            rider.name
                          }
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
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {
                              rider.status
                            }
                          </span>

                        </td>

                        <td className="p-4 font-bold text-orange-600">
                          ⭐
                          {" "}
                          {rider.rating ||
                            5}
                        </td>

                        <td className="p-4 font-bold text-blue-600">
                          {
                            rider.completedDeliveries ||
                            0
                          }
                        </td>

                        <td className="p-4 font-bold text-green-600">
                          ₹
                          {rider.earnings ||
                            0}
                        </td>

                      </tr>
                    )
                  )}

                  {riders.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={
                          6
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









