"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function RiderDocumentsPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin-rider-documents", {
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
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = riders.filter((rider) =>
    `${rider.name || ""} ${rider.mobile || ""} ${rider.vehicle || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function DocumentButton({
    href,
    label,
    tone,
  }: {
    href?: string;
    label: string;
    tone: string;
  }) {
    if (!href) {
      return (
        <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-400">
          {label}: Not Uploaded
        </span>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`rounded-2xl px-3 py-2 text-xs font-bold text-white ${tone}`}
      >
        {label}
      </a>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Compliance
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Rider Documents
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review delivery partner identity and vehicle documents.
            </p>
          </div>

          <button
            onClick={loadDocuments}
            className="rounded-2xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0a504c]"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Document Verification
              </h2>
              <p className="text-sm text-gray-500">
                {filtered.length} rider(s) displayed
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rider..."
              className="w-full rounded-2xl border border-slate-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447] md:w-80"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center text-gray-500">
              Loading documents...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center text-gray-500">
              No Documents Found
            </div>
          ) : (
            <div className="grid gap-5">
              {filtered.map((rider) => (
                <div
                  key={rider.id}
                  className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#063f3d] font-bold text-white">
                          {rider.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>

                        <div>
                          <h3 className="font-bold text-[#123b39]">
                            {rider.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {rider.mobile || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-2xl bg-white px-3 py-2 text-gray-600">
                          Vehicle: <b>{rider.vehicle || "—"}</b>
                        </span>

                        <span className="rounded-2xl bg-white px-3 py-2 text-gray-600">
                          Status: <b>{rider.approvalStatus || "—"}</b>
                        </span>
                      </div>
                    </div>

                    <div className="flex max-w-2xl flex-wrap gap-2">
                      <DocumentButton
                        href={rider.photo}
                        label="Photo"
                        tone="bg-blue-600"
                      />

                      <DocumentButton
                        href={rider.aadhaarFront}
                        label="Aadhaar Front"
                        tone="bg-green-600"
                      />

                      <DocumentButton
                        href={rider.aadhaarBack}
                        label="Aadhaar Back"
                        tone="bg-emerald-700"
                      />

                      <DocumentButton
                        href={rider.licenseFile}
                        label="Driving License"
                        tone="bg-orange-500"
                      />

                      <DocumentButton
                        href={rider.rcFile}
                        label="Vehicle RC"
                        tone="bg-purple-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}









