"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function CustomerNotificationsPage() {
  const [notifications,
    setNotifications] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const data = JSON.parse(
      localStorage.getItem(
        "customer-notifications"
      ) || "[]"
    );

    setNotifications(data);
  }

  function addDemoNotification() {
    const notification = {
      id: Date.now(),
      customer:
        "Demo Customer",
      phone:
        "9999999999",
      message:
        "Order Out For Delivery",
      createdAt:
        new Date().toLocaleString(),
    };

    const updated = [
      notification,
      ...notifications,
    ];

    localStorage.setItem(
      "customer-notifications",
      JSON.stringify(updated)
    );

    setNotifications(updated);
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Customer Notifications
          </h1>

          <p className="text-gray-500">
            Delivery SMS / WhatsApp Logs
          </p>

        </div>

        <button
          onClick={
            addDemoNotification
          }
          className="bg-green-600 text-white px-5 py-3 rounded-2xl"
        >
          Test Notification
        </button>

      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-4 text-left">
                Customer
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                Message
              </th>

              <th className="p-4 text-left">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {notifications.length ===
            0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center p-8"
                >
                  No Notifications
                </td>
              </tr>
            ) : (
              notifications.map(
                (
                  item: any
                ) => (
                  <tr
                    key={
                      item.id
                    }
                    className="border-t"
                  >
                    <td className="p-4">
                      {
                        item.customer
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.phone
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.message
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.createdAt
                      }
                    </td>
                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}









