"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    const data = JSON.parse(
      localStorage.getItem("freshcut-notifications") || "[]"
    );

    setNotifications(data);
  }

  function sendNotification() {
    if (!title || !message) {
      alert("Fill All Fields");
      return;
    }

    const notification = {
      id: Date.now(),
      title,
      message,
      date: new Date().toLocaleString(),
      status: "Sent",
    };

    const updated = [notification, ...notifications];

    localStorage.setItem(
      "freshcut-notifications",
      JSON.stringify(updated)
    );

    setNotifications(updated);
    setTitle("");
    setMessage("");

    alert("Notification Sent Successfully");
  }

  function deleteNotification(id: number) {
    if (!confirm("Delete Notification?")) return;

    const updated = notifications.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      "freshcut-notifications",
      JSON.stringify(updated)
    );

    setNotifications(updated);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">

      <div className="max-w-\[1600px\] mx-auto space-y-6">

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-xl shadow-xl p-8">

          <h1 className="text-4xl font-bold text-slate-800">
            Notification Center
          </h1>

          <p className="text-slate-500 mt-2">
            Customer Alerts & Push Notifications
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-slate-500">Total Notifications</p>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">
              {notifications.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-slate-500">Today's Broadcast</p>
            <h2 className="text-4xl font-bold text-emerald-600 mt-2">
              {notifications.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-slate-500">Status</p>
            <h2 className="text-2xl font-bold text-blue-600 mt-3">
              Active
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Send Notification
          </h2>

          <div className="space-y-6">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification Title"
              className="w-full border border-slate-200 p-4 rounded-2xl"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification Message"
              rows={5}
              className="w-full border border-slate-200 p-4 rounded-2xl"
            />

            <button
              onClick={sendNotification}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold"
            >
              Send Notification
            </button>

          </div>

        </div>

        <div className="space-y-6">

          {notifications.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >

              <div className="flex justify-between gap-5">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {item.message}
                  </p>

                  <p className="mt-3 text-sm text-slate-400">
                    {item.date}
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteNotification(item.id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-2xl h-fit"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}









