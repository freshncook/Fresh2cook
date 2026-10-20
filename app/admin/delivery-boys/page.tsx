"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

interface DeliveryBoy {
  id: number;
  name: string;
  mobile: string;
  vehicle: string;
  status: string;
  createdAt: string;
}

export default function DeliveryBoysPage() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBoys();
  }, []);

  async function loadBoys() {
    try {
      setLoading(true);
      const res = await fetch("/api/delivery-boys", { cache: "no-store" });
      const data = await res.json();

      setBoys(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.riders)
          ? data.riders
          : []
      );
    } catch (error) {
      console.error(error);
      alert("Failed To Load Delivery Boys");
    } finally {
      setLoading(false);
    }
  }

  async function addBoy() {
    if (!name.trim() || !mobile.trim() || !vehicle.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/delivery-boys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          vehicle: vehicle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || "Failed to add delivery boy");
      }

      setName("");
      setMobile("");
      setVehicle("");

      await loadBoys();
      alert("Delivery Boy Added Successfully");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Failed To Add Delivery Boy");
    }
  }

  const filteredBoys = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return boys;

    return boys.filter((boy) =>
      `${boy.name} ${boy.mobile} ${boy.vehicle} ${boy.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [boys, search]);

  const available = boys.filter(
    (boy) => boy.status === "Available" || boy.status === "Online"
  ).length;

  const busy = boys.filter((boy) => boy.status === "Busy").length;

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Delivery Management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Delivery Boys
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage riders, vehicles and availability.
            </p>
          </div>

          <button
            onClick={loadBoys}
            className="rounded-2xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a504c]"
          >
            ↻ Refresh Riders
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Riders
            </p>
            <p className="mt-2 text-3xl font-bold text-[#123b39]">
              {boys.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Available
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {available}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Busy
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-500">
              {busy}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Offline / Other
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-500">
              {Math.max(0, boys.length - available - busy)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#123b39]">
              Add Delivery Boy
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a new rider profile for Fresh2Cook delivery operations.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rider Name"
              className="rounded-2xl border border-slate-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#159447] focus:bg-white"
            />

            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile Number"
              className="rounded-2xl border border-slate-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#159447] focus:bg-white"
            />

            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Vehicle Number / Type"
              className="rounded-2xl border border-slate-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#159447] focus:bg-white"
            />
          </div>

          <button
            onClick={addBoy}
            className="mt-4 rounded-2xl bg-[#159447] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#117b3b]"
          >
            + Add Delivery Boy
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Rider Directory
              </h2>
              <p className="text-sm text-gray-500">
                {filteredBoys.length} rider(s) displayed
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rider, mobile, vehicle..."
              className="w-full rounded-2xl border border-slate-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447] md:w-80"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center text-sm text-gray-500">
              Loading riders...
            </div>
          ) : filteredBoys.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center">
              <p className="font-semibold text-gray-600">
                No Delivery Boys Found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Add a rider or change your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredBoys.map((boy) => {
                const isAvailable =
                  boy.status === "Available" || boy.status === "Online";

                return (
                  <div
                    key={boy.id}
                    className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063f3d] text-lg font-bold text-white">
                          {boy.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>

                        <div>
                          <h3 className="font-bold text-[#123b39]">
                            {boy.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Rider #{boy.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : boy.status === "Busy"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-50 text-gray-600"
                        }`}
                      >
                        {boy.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
                      <div className="flex justify-between gap-5">
                        <span className="text-gray-400">Mobile</span>
                        <span className="font-semibold text-gray-700">
                          {boy.mobile}
                        </span>
                      </div>

                      <div className="flex justify-between gap-5">
                        <span className="text-gray-400">Vehicle</span>
                        <span className="font-semibold text-gray-700">
                          {boy.vehicle}
                        </span>
                      </div>

                      <div className="flex justify-between gap-5">
                        <span className="text-gray-400">Joined</span>
                        <span className="font-semibold text-gray-700">
                          {boy.createdAt
                            ? new Date(boy.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}









