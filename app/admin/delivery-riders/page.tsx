"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryRidersPage() {
  const [riders, setRiders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadRiders();

    const interval =
      setInterval(() => {
        loadRiders();
      }, 10000);

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

  async function forceOffline(
    riderId: number
  ) {
    try {
      await fetch(
        "/api/delivery-live-status",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            riderId,
            status:
              "Offline",
          }),
        }
      );

      loadRiders();

      alert(
        "Rider Marked Offline"
      );
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Delivery Riders
        </h1>

        <p className="text-gray-500">
          Rider Management Panel
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-5">

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-gray-500">
            Total Riders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {riders.length}
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-gray-500">
            Online
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              riders.filter(
                (r) =>
                  r.status ===
                  "Online"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-gray-500">
            On Delivery
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {
              riders.filter(
                (r) =>
                  r.status ===
                  "On Delivery"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-gray-500">
            Offline
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {
              riders.filter(
                (r) =>
                  r.status ===
                  "Offline"
              ).length
            }
          </h2>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {riders.map(
          (rider: any) => (

            <div
              key={rider.id}
              className="bg-white border rounded-2xl p-5"
            >

              <div className="flex items-center gap-5">

                <img
                  src={
                    rider.photo ||
                    "/user.png"
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border object-cover"
                />

                <div>

                  <h2 className="text-xl font-bold">
                    {rider.name}
                  </h2>

                  <p className="text-gray-500">
                    {rider.mobile}
                  </p>

                  <p className="text-gray-500">
                    {rider.vehicle}
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-5 mt-5">

                <div>
                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="font-semibold">
                    {rider.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Current Order
                  </p>

                  <p className="font-semibold">
                    {rider.currentOrder ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Today's Deliveries
                  </p>

                  <p className="font-semibold">
                    {
                      rider.todayDeliveries
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Earnings
                  </p>

                  <p className="font-semibold">
                    ₹
                    {rider.earnings}
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-2">

                <p>
                  <strong>
                    Latitude:
                  </strong>{" "}
                  {rider.latitude ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Longitude:
                  </strong>{" "}
                  {rider.longitude ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Speed:
                  </strong>{" "}
                  {rider.speed ||
                    0} km/h
                </p>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                {rider.latitude &&
                  rider.longitude && (

                  <a
                    href={`https://www.google.com/maps?q=${rider.latitude},${rider.longitude}`}
                    target="_blank"
                    className="bg-blue-600 text-white px-4 py-2 rounded-2xl"
                  >
                    Open Map
                  </a>

                )}

                <button
                  onClick={() =>
                    forceOffline(
                      rider.id
                    )
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-2xl"
                >
                  Force Offline
                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}









