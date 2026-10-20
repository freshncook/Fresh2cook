"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  function loadBanners() {
    try {
      setBanners(
        JSON.parse(localStorage.getItem("freshcut-banners") || "[]")
      );
    } catch {
      setBanners([]);
    }
  }

  function addBanner() {
    if (!title || !image) {
      alert("Enter Banner Title & Image URL");
      return;
    }

    const banner = {
      id: Date.now(),
      title,
      image,
      active: true,
    };

    const updated = [banner, ...banners];
    localStorage.setItem("freshcut-banners", JSON.stringify(updated));
    setBanners(updated);
    setTitle("");
    setImage("");
  }

  function toggleBanner(id: number) {
    const updated = banners.map((banner) =>
      banner.id === id
        ? { ...banner, active: !banner.active }
        : banner
    );

    localStorage.setItem("freshcut-banners", JSON.stringify(updated));
    setBanners(updated);
  }

  function deleteBanner(id: number) {
    if (!confirm("Delete Banner?")) return;

    const updated = banners.filter((banner) => banner.id !== id);
    localStorage.setItem("freshcut-banners", JSON.stringify(updated));
    setBanners(updated);
  }

  const activeCount = banners.filter((banner) => banner.active).length;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Banner Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage promotional banners displayed in the system.
          </p>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Banners
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#123b38]">
              {banners.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">
              Active Banners
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-800">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">
            Add New Banner
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Banner Title"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Banner Image URL"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <button
              onClick={addBanner}
              className="rounded-xl bg-[#063f3d] py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
            >
              + Add Banner
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="h-56 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-extrabold text-[#123b38]">
                    {banner.title}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      banner.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => toggleBanner(banner.id)}
                    className="flex-1 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!banners.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No banners available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






