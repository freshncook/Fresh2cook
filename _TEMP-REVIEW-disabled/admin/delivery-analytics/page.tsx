"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryAnalyticsPage() {
  const [stats, setStats] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadAnalytics();

    const interval =
      setInterval(
        loadAnalytics,
        10000
      );

    return () =>
      clearInterval(interval);
  }, []);

  async function loadAnalytics() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-analytics"
        );

      const data =
        await res.json();

      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Delivery Analytics
          </h1>

          <p className="text-gray-500 mt-2">
            Live Delivery Control Tower
          </p>

        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5">

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Riders
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {stats?.totalRiders || 0}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Online Riders
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-2">
              {stats?.onlineRiders || 0}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Assignments
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              {stats?.totalAssignments || 0}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Delivered
            </p>

            <h2 className="text-4xl font-bold text-green-700 mt-2">
              {stats?.deliveredOrders || 0}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Pending
            </p>

            <h2 className="text-4xl font-bold text-orange-600 mt-2">
              {stats?.pendingOrders || 0}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Avg Rating
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-2">
              ÃƒÂ¢Ã‚Â­Ã‚Â{" "}
              {Number(
                stats?.averageRating || 0
              ).toFixed(1)}
            </h2>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow p-8">

            <h3 className="text-2xl font-bold mb-4">
              Revenue Overview
            </h3>

            <div className="text-5xl font-bold text-green-600">
              Ã¢â€šÂ¹
              {stats?.totalEarnings || 0}
            </div>

            <p className="text-gray-500 mt-3">
              Total Rider Earnings
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-8">

            <h3 className="text-2xl font-bold mb-4">
              System Health
            </h3>

            <div className="space-y-3">

              <div className="flex justify-between">
                <span>
                  Rider Network
                </span>

                <span className="text-green-600 font-bold">
                  Active
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  GPS Tracking
                </span>

                <span className="text-green-600 font-bold">
                  Running
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Auto Assignment
                </span>

                <span className="text-green-600 font-bold">
                  Enabled
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Auto Reassign
                </span>

                <span className="text-green-600 font-bold">
                  Enabled
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}






