"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Rider = {
  id: number;
  name: string;
  mobile?: string;
  vehicle?: string | null;
  address?: string | null;
  approvalStatus?: string | null;
  status?: string | null;
  createdAt?: string;
};

export default function RiderApprovalsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadRiders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-rider-approvals", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Riders load nahi hue.");
      }
      setRiders(Array.isArray(data.riders) ? data.riders : []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Loading failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRiders();
  }, [loadRiders]);

  async function updateStatus(riderId: number, status: "Approved" | "Rejected" | "Pending") {
    const rider = riders.find((item) => item.id === riderId);
    if (!rider) return;

    const action = status === "Approved" ? "approve" : status === "Rejected" ? "reject" : "reset";
    if (!window.confirm(`${rider.name} ko ${action} karna hai?`)) return;

    setBusyId(riderId);
    setMessage("");

    try {
      const response = await fetch("/api/admin-rider-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ riderId, status }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Status update nahi hua.");
      }

      setMessage(`${rider.name}: ${status} successfully.`);
      await loadRiders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => ({
    total: riders.length,
    pending: riders.filter((r) => (r.approvalStatus || "Pending") === "Pending").length,
    approved: riders.filter((r) => r.approvalStatus === "Approved").length,
    rejected: riders.filter((r) => r.approvalStatus === "Rejected").length,
  }), [riders]);

  const visibleRiders = useMemo(() => riders.filter((rider) => {
    const status = rider.approvalStatus || "Pending";
    const matchesStatus = filter === "All" || status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      String(rider.name || "").toLowerCase().includes(query) ||
      String(rider.mobile || "").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [riders, filter, search]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Fresh2Cook Admin</p>
            <h1 className="mt-1 text-3xl font-bold">Rider Approvals</h1>
            <p className="mt-1 text-sm text-slate-500">Registration requests ko review aur approve karein.</p>
          </div>
          <button onClick={() => void loadRiders()} className="rounded-xl border bg-white px-4 py-2 font-semibold shadow-sm hover:bg-slate-100">
            Refresh
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total Riders", counts.total, "text-slate-900"],
            ["Pending", counts.pending, "text-amber-700"],
            ["Approved", counts.approved, "text-emerald-700"],
            ["Rejected", counts.rejected, "text-rose-700"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {message && (
          <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rider name ya mobile search karein..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
            />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3">
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="All">All Riders</option>
            </select>
          </div>

          {loading ? (
            <p className="py-12 text-center text-slate-500">Riders load ho rahe hain...</p>
          ) : visibleRiders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-semibold">Koi rider nahi mila.</p>
              <p className="mt-1 text-sm text-slate-500">Filter change karein ya Refresh dabayein.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-3">Rider</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRiders.map((rider) => {
                    const status = rider.approvalStatus || "Pending";
                    return (
                      <tr key={rider.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-semibold">{rider.name}</p>
                          <p className="text-xs text-slate-500">ID: {rider.id}</p>
                        </td>
                        <td className="p-3">{rider.mobile || "—"}</td>
                        <td className="p-3">{rider.vehicle || "—"}</td>
                        <td className="p-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                            status === "Rejected" ? "bg-rose-100 text-rose-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>{status}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {status !== "Approved" && (
                              <button disabled={busyId === rider.id} onClick={() => void updateStatus(rider.id, "Approved")} className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                {busyId === rider.id ? "Saving..." : "Approve"}
                              </button>
                            )}
                            {status !== "Rejected" && (
                              <button disabled={busyId === rider.id} onClick={() => void updateStatus(rider.id, "Rejected")} className="rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                                Reject
                              </button>
                            )}
                            {status !== "Pending" && (
                              <button disabled={busyId === rider.id} onClick={() => void updateStatus(rider.id, "Pending")} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold hover:bg-slate-100 disabled:opacity-50">
                                Reset Pending
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
