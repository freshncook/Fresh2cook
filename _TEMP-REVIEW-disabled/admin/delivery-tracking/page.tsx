"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryTrackingPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRiders();

    const interval = setInterval(loadRiders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadRiders() {
    try {
      const res = await fetch("/api/admin-live-riders", {
        cache: "no-store",
      });

      const data = await res.json();

      setRiders(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.riders)
          ? data.riders
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = riders.filter((rider) =>
    `${rider.name || ""} ${rider.mobile || ""} ${rider.vehicle || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const online = riders.filter((r) => r.status === "Online").length;
  const delivery = riders.filter((r) => r.status === "On Delivery").length;
  const offline = riders.filter((r) => r.status === "Offline").length;

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Delivery Operations
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Live Delivery Tracking
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time rider location and delivery monitoring.
            </p>
          </div>

          <button
            onClick={loadRiders}
            className="rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0a504c]"
          >
            â†» Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase text-gray-400">Total Riders</p>
            <p className="mt-2 text-3xl font-bold text-[#123b39]">{riders.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase text-gray-400">Online</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{online}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase text-gray-400">On Delivery</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{delivery}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase text-gray-400">Offline</p>
            <p className="mt-2 text-3xl font-bold text-red-500">{offline}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Live Rider Locations
              </h2>
              <p className="text-sm text-gray-500">
                Automatically refreshed every 10 seconds.
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rider..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447] md:w-80"
            />
          </div>

          {loading ? (
            <div className="rounded-xl bg-gray-50 p-12 text-center text-gray-500">
              Loading live riders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-12 text-center text-gray-500">
              No Riders Found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((rider) => (
                <div
                  key={rider.id}
                  className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#123b39]">
                        {rider.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {rider.mobile || "â€”"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {rider.vehicle || "â€”"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        rider.status === "Online"
                          ? "bg-green-100 text-green-700"
                          : rider.status === "On Delivery"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-50 text-gray-600"
                      }`}
                    >
                      {rider.status || "Offline"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-gray-400">Latitude</p>
                      <p className="mt-1 truncate text-sm font-bold text-gray-700">
                        {rider.latitude ?? "â€”"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-gray-400">Longitude</p>
                      <p className="mt-1 truncate text-sm font-bold text-gray-700">
                        {rider.longitude ?? "â€”"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-gray-400">Speed</p>
                      <p className="mt-1 text-sm font-bold text-gray-700">
                        {rider.speed || 0} km/h
                      </p>
                    </div>
                  </div>

                  {rider.latitude && rider.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${rider.latitude},${rider.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block rounded-xl bg-[#159447] py-3 text-center text-sm font-bold text-white hover:bg-[#117b3b]"
                    >
                      Open Rider Location
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






