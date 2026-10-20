"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const riderRes = await fetch(
        "/api/delivery-live-status"
      );

      const riderData =
        await riderRes.json();

      setRiders(
        Array.isArray(riderData)
          ? riderData
          : []
      );

      const alertRes = await fetch(
        "/api/admin-delivery-alerts"
      );

      const alertData =
        await alertRes.json();

      const pendingAlerts =
        alertData.alerts || [];

      setAlerts(pendingAlerts);

      if (pendingAlerts.length > 0) {
        const audio = new Audio(
          "/warning.mp3"
        );

        audio.play().catch(() => {});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">

      {/* ALERT POPUP */}

      {alerts.length > 0 && (
        <div className="mb-6 bg-red-600 text-white p-5 rounded-2xl shadow-sm animate-pulse">

          <div className="flex justify-between items-center">

            <div>
              <h2 className="text-2xl font-bold">
                ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¨ Delivery Alert
              </h2>

              <p>
                {alerts.length} Order(s)
                Rejected / Expired
              </p>
            </div>

            <button
              onClick={() =>
                (window.location.href =
                  "/admin/manual-assignment")
              }
              className="bg-white text-red-600 px-5 py-3 rounded-xl font-bold"
            >
              Assign Manually
            </button>

          </div>

        </div>
      )}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Delivery Riders
          </h1>

          <p className="text-gray-500">
            Live Rider Monitoring
          </p>

        </div>

        <button
          onClick={loadData}
          className="bg-green-600 text-white px-5 py-3 rounded-xl"
        >
          Refresh
        </button>

      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          Loading...
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          No Riders Found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-white rounded-xl border shadow-sm p-6"
            >

              <div className="flex items-center gap-4">

                <img
                  src={
                    rider.photo ||
                    "/user.png"
                  }
                  alt=""
                  className="h-16 w-16 rounded-full object-cover border"
                />

                <div>

                  <h2 className="font-bold text-xl">
                    {rider.name}
                  </h2>

                  <p className="text-gray-500">
                    {rider.mobile}
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-2">

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      rider.status ===
                      "Available"
                        ? "text-green-600"
                        : rider.status ===
                          "Busy"
                        ? "text-orange-600"
                        : "text-red-600"
                    }
                  >
                    {rider.status}
                  </span>
                </p>

                <p>
                  <strong>Rating:</strong>
                  {" "}ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â {rider.rating}
                </p>

                <p>
                  <strong>Completed:</strong>
                  {" "}
                  {
                    rider.completedDeliveries
                  }
                </p>

                <p>
                  <strong>Earnings:</strong>
                  {" "}ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹
                  {rider.earnings}
                </p>

                <p>
                  <strong>Speed:</strong>
                  {" "}
                  {Number(
                    rider.speed || 0
                  ).toFixed(0)}
                  {" "}km/h
                </p>

              </div>

              {rider.latitude &&
                rider.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${rider.latitude},${rider.longitude}`}
                    target="_blank"
                    className="block mt-5 text-center bg-blue-600 text-white py-3 rounded-xl"
                  >
                    View Live Location
                  </a>
                )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}







