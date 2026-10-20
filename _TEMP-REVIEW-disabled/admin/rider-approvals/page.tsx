"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

type Rider = {
  id: number;
  name: string;
  mobile: string;
  vehicle: string;
  approvalStatus: string;
};

export default function RiderApprovalsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadRiders() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin-rider-approvals", {
        cache: "no-store",
      });

      const data = await res.json();

      setRiders(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.riders)
          ? data.riders
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(error);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(riderId: number, status: string) {
    try {
      const res = await fetch("/api/admin-rider-approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          riderId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Status update failed");
      }

      await loadRiders();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Status update failed");
    }
  }

  useEffect(() => {
    loadRiders();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return riders;

    return riders.filter((rider) =>
      `${rider.name} ${rider.mobile} ${rider.vehicle} ${rider.approvalStatus}`
        .toLowerCase()
        .includes(q)
    );
  }, [riders, search]);

  const pending = riders.filter(
    (r) => r.approvalStatus === "Pending"
  ).length;

  const approved = riders.filter(
    (r) => r.approvalStatus === "Approved"
  ).length;

  const rejected = riders.filter(
    (r) => r.approvalStatus === "Rejected"
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Rider Management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Rider Approvals
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage delivery partner approval status.
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
            <p className="text-xs uppercase font-semibold text-gray-400">Total</p>
            <p className="mt-2 text-3xl font-bold text-[#123b39]">{riders.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs uppercase font-semibold text-gray-400">Pending</p>
            <p className="mt-2 text-3xl font-bold text-orange-500">{pending}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs uppercase font-semibold text-gray-400">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{approved}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs uppercase font-semibold text-gray-400">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-500">{rejected}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Approval Queue
              </h2>
              <p className="text-sm text-gray-500">
                {filtered.length} rider(s)
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
            <div className="p-12 text-center text-gray-500">
              Loading approvals...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No riders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#f8faf9]">
                  <tr>
                    <th className="p-4 text-left text-xs uppercase text-gray-400">Rider</th>
                    <th className="p-4 text-left text-xs uppercase text-gray-400">Mobile</th>
                    <th className="p-4 text-left text-xs uppercase text-gray-400">Vehicle</th>
                    <th className="p-4 text-left text-xs uppercase text-gray-400">Status</th>
                    <th className="p-4 text-left text-xs uppercase text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((rider) => (
                    <tr key={rider.id} className="border-t border-gray-100">
                      <td className="p-4 font-semibold text-[#123b39]">
                        {rider.name}
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {rider.mobile}
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {rider.vehicle}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            rider.approvalStatus === "Approved"
                              ? "bg-green-100 text-green-700"
                              : rider.approvalStatus === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {rider.approvalStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(rider.id, "Approved")}
                            className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(rider.id, "Rejected")}
                            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






