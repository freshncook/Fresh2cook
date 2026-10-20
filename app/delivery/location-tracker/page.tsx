"use client";

import { useEffect, useState } from "react";

export default function LocationTrackerPage() {
  const [status, setStatus] =
    useState("Starting GPS...");

  const [coords, setCoords] =
    useState<any>(null);

  const [speed, setSpeed] =
    useState(0);

  useEffect(() => {
    startTracking();
  }, []);

  function startTracking() {
    const session =
      localStorage.getItem(
        "delivery-session"
      );

    if (!session) {
      setStatus(
        "Login Required"
      );
      return;
    }

    const data =
      JSON.parse(session);

    const rider =
      data.rider || data;

    if (
      !navigator.geolocation
    ) {
      setStatus(
        "GPS Not Supported"
      );
      return;
    }

    navigator.geolocation.watchPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const currentSpeed =
          Math.round(
            (position.coords.speed ||
              0) * 3.6
          );

        setCoords({
          latitude,
          longitude,
        });

        setSpeed(
          currentSpeed
        );

        try {
          await fetch(
            "/api/delivery-location-update",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                riderId:
                  rider.id,
                latitude,
                longitude,
                speed:
                  currentSpeed,
              }),
            }
          );

          setStatus(
            "Live Tracking Active"
          );
        } catch {
          setStatus(
            "Update Failed"
          );
        }
      },
      () => {
        setStatus(
          "Location Permission Denied"
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-6">
          Live GPS Tracking
        </h1>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-green-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Status
            </p>

            <h2 className="font-bold text-green-600 mt-2">
              {status}
            </h2>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Speed
            </p>

            <h2 className="font-bold text-blue-600 mt-2">
              {speed} km/h
            </h2>
          </div>

          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              GPS
            </p>

            <h2 className="font-bold text-purple-600 mt-2">
              Active
            </h2>
          </div>

        </div>

        {coords && (
          <div className="mt-8 bg-gray-50 rounded-2xl p-6">

            <div className="mb-4">
              <strong>
                Latitude:
              </strong>{" "}
              {coords.latitude}
            </div>

            <div>
              <strong>
                Longitude:
              </strong>{" "}
              {coords.longitude}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}




