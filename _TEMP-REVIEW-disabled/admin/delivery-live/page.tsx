"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryLivePage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [assignments, setAssignments] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();

    const interval =
      setInterval(
        loadData,
        5000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  async function loadData() {
    try {
      const ridersRes =
        await fetch(
          "/api/delivery-boys"
        );

      const ridersData =
        await ridersRes.json();

      const assignmentRes =
        await fetch(
          "/api/delivery-assignments"
        );

      const assignmentData =
        await assignmentRes.json();

      setRiders(
        ridersData || []
      );

      setAssignments(
        assignmentData || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const onlineRiders =
    riders.filter(
      (r) =>
        r.status ===
        "Online"
    );

  const offlineRiders =
    riders.filter(
      (r) =>
        r.status !==
        "Online"
    );

  const assignedOrders =
    assignments.filter(
      (a) =>
        a.status ===
        "Assigned"
    );

  const acceptedOrders =
    assignments.filter(
      (a) =>
        a.status ===
        "Accepted"
    );

  const deliveredOrders =
    assignments.filter(
      (a) =>
        a.status ===
        "Delivered"
    );

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h1 className="text-4xl font-bold">
            Live Delivery Control
          </h1>

          <p className="text-gray-500 mt-2">
            Real Time Rider Monitoring
          </p>

        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow p-5">

            <p>
              Total Riders
            </p>

            <h2 className="text-4xl font-bold">
              {riders.length}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <p>
              Online
            </p>

            <h2 className="text-4xl font-bold text-green-600">
              {
                onlineRiders.length
              }
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <p>
              Assigned
            </p>

            <h2 className="text-4xl font-bold text-orange-600">
              {
                assignedOrders.length
              }
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <p>
              Accepted
            </p>

            <h2 className="text-4xl font-bold text-blue-600">
              {
                acceptedOrders.length
              }
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <p>
              Delivered
            </p>

            <h2 className="text-4xl font-bold text-purple-600">
              {
                deliveredOrders.length
              }
            </h2>

          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-5">
              Online Riders
            </h2>

            <div className="space-y-4">

              {onlineRiders.map(
                (rider) => (
                  <div
                    key={
                      rider.id
                    }
                    className="border rounded-2xl p-4"
                  >
                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-bold text-lg">
                          {
                            rider.name
                          }
                        </h3>

                        <p>
                          {
                            rider.mobile
                          }
                        </p>

                        <p>
                          Vehicle :
                          {" "}
                          {
                            rider.vehicle
                          }
                        </p>

                      </div>

                      <div className="text-right">

                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                          Online
                        </span>

                        <div className="mt-2 font-bold">
                          ÃƒÂ¢Ã‚Â­Ã‚Â
                          {" "}
                          {
                            rider.rating
                          }
                        </div>

                      </div>

                    </div>

                  </div>
                )
              )}

              {onlineRiders.length ===
                0 && (
                <div className="text-center py-10 text-gray-500">
                  No Online Riders
                </div>
              )}

            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-5">
              Active Deliveries
            </h2>

            <div className="space-y-4">

              {assignments.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="border rounded-2xl p-4"
                  >
                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-bold">
                          Order #
                          {
                            item.orderId
                          }
                        </h3>

                        <p>
                          Rider ID :
                          {" "}
                          {
                            item.deliveryBoyId
                          }
                        </p>

                        <p>
                          OTP :
                          {" "}
                          {
                            item.otp
                          }
                        </p>

                      </div>

                      <div>

                        <span
                          className={`px-4 py-2 rounded-full ${
                            item.status ===
                            "Delivered"
                              ? "bg-green-100 text-green-700"
                              : item.status ===
                                "Accepted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {
                            item.status
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                )
              )}

              {assignments.length ===
                0 && (
                <div className="text-center py-10 text-gray-500">
                  No Active Deliveries
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}






