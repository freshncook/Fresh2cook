"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function LiveMapPage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadRiders();

    const interval =
      setInterval(
        loadRiders,
        10000
      );

    return () =>
      clearInterval(interval);
  }, []);

  async function loadRiders() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-riders"
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

  function openMap(
    latitude: number,
    longitude: number
  ) {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading Live Riders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Live Rider Map
          </h1>

          <p className="text-gray-500 mt-2">
            Real Time GPS Tracking
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {riders.map(
            (rider: any) => (
              <div
                key={rider.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-bold">
                      {rider.name}
                    </h2>

                    <p className="text-gray-500">
                      {rider.mobile}
                    </p>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      rider.status ===
                        "Online" ||
                      rider.status ===
                        "On Delivery"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {rider.status}
                  </span>

                </div>

                <div className="mt-5 space-y-2">

                  <p>
                    ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â Latitude:
                    {" "}
                    {rider.latitude ||
                      "-"}
                  </p>

                  <p>
                    ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â Longitude:
                    {" "}
                    {rider.longitude ||
                      "-"}
                  </p>

                  <p>
                    ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â´ Speed:
                    {" "}
                    {rider.speed ||
                      0}
                    {" "}km/h
                  </p>

                  <p>
                    ÃƒÂ¢Ã‚Â­Ã‚Â Rating:
                    {" "}
                    {rider.rating}
                  </p>

                  <p>
                    ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ Completed:
                    {" "}
                    {
                      rider.completedDeliveries
                    }
                  </p>

                  <p>
                    ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â° Earnings:
                    Ã¢â€šÂ¹
                    {rider.earnings}
                  </p>

                </div>

                <div className="mt-4 text-sm text-gray-500">

                  Last Seen:
                  {" "}
                  {rider.lastSeen
                    ? new Date(
                        rider.lastSeen
                      ).toLocaleString()
                    : "N/A"}

                </div>

                <button
                  disabled={
                    !rider.latitude ||
                    !rider.longitude
                  }
                  onClick={() =>
                    openMap(
                      rider.latitude,
                      rider.longitude
                    )
                  }
                  className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl disabled:bg-gray-300"
                >
                  Open In Google Maps
                </button>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}






