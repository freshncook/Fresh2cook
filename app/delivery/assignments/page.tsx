"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [assignments, setAssignments] =
    useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res =
      await fetch(
        "/api/delivery-assignments"
      );

    const json =
      await res.json();

    setAssignments(
      json.assignments || []
    );
  }

  async function updateStatus(
    id: number,
    action: string
  ) {
    await fetch(
      `/api/delivery-assignments/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      }
    );

    load();
  }

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Delivery Assignments
        </h1>

        <button
          onClick={load}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto">

        <table className="w-full">

          <thead>
            <tr>

              <th className="p-3 text-left">
                Order
              </th>

              <th className="p-3 text-left">
                Customer
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Pickup
              </th>

              <th className="p-3 text-left">
                Delivery
              </th>

              <th className="p-3 text-left">
                OTP
              </th>

              <th className="p-3 text-left">
                Earnings
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {assignments.map(
              (a) => (
                <tr
                  key={a.id}
                  className="border-b"
                >

                  <td className="p-3">
                    #{a.orderId}
                  </td>

                  <td className="p-3">
                    <div>
                      {a.order?.customerName ||
                        "-"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {a.order?.customerMobile ||
                        "-"}
                    </div>
                  </td>

                  <td className="p-3">
                    {a.status}
                  </td>

                  <td className="p-3">
                    {a.pickedAt
                      ? new Date(
                          a.pickedAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {a.deliveredAt
                      ? new Date(
                          a.deliveredAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-3">

                    {a.status ===
                    "Delivered"
                      ? "Verified"
                      : a.status ===
                        "Otp Sent"
                      ? "Waiting"
                      : "-"}

                  </td>

                  <td className="p-3">
                    ?
                    {a.status ===
                    "Delivered"
                      ? a.earnings || 25
                      : 0}
                  </td>

                  <td className="p-3">

                    <div className="flex gap-2 flex-wrap">

                      {a.status ===
                        "Pending Acceptance" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(
                                a.id,
                                "accept"
                              )
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                a.id,
                                "reject"
                              )
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {a.status ===
                        "Accepted" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              a.id,
                              "pickup"
                            )
                          }
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Picked Up
                        </button>
                      )}

                      {a.status ===
                        "Picked Up" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              a.id,
                              "sendOtp"
                            )
                          }
                          className="bg-orange-600 text-white px-3 py-1 rounded"
                        >
                          Send OTP
                        </button>
                      )}

                      {a.status ===
                        "Otp Sent" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              a.id,
                              "verifyOtp"
                            )
                          }
                          className="bg-purple-600 text-white px-3 py-1 rounded"
                        >
                          Deliver
                        </button>
                      )}

                    </div>

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





