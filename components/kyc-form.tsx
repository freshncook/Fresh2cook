"use client";

import { useEffect, useState } from "react";

/*
 * KYC form for riders and processing staff:
 * document photos (upload), full address + landmark + GPS, local reference (riders).
 * onSave(fields) saves; onSubmit() sends for admin approval.
 */

export type Kyc = {
  photo?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  license?: string;
  rc?: string;
  pan?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  lat?: number | null;
  lng?: number | null;
  refName?: string;
  refMobile?: string;
  status?: string;
  note?: string;
};

const DOCS = {
  rider: [
    ["photo", "Photo"],
    ["aadhaarFront", "Aadhaar front"],
    ["aadhaarBack", "Aadhaar back"],
    ["license", "Driving licence"],
    ["rc", "Vehicle RC"],
    ["pan", "PAN card"],
  ],
  staff: [
    ["photo", "Photo"],
    ["aadhaarFront", "Aadhaar front"],
    ["aadhaarBack", "Aadhaar back"],
    ["pan", "PAN card"],
  ],
} as const;

async function upload(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("private", "1"); // KYC documents are private (admin + owner only)
  const r = await fetch("/api/upload-file", { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  if (!j.url) throw new Error(j.error || "Upload failed");
  return String(j.url);
}

const STATUS_STYLE: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Submitted: "bg-blue-50 text-blue-700 ring-blue-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  Incomplete: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function KycForm({
  kind,
  kyc,
  missing,
  onSave,
  onSubmit,
}: {
  kind: "rider" | "staff";
  kyc: Kyc;
  missing: string[];
  onSave: (fields: Partial<Kyc>) => Promise<void>;
  onSubmit: () => Promise<void>;
}) {
  const [form, setForm] = useState({ address: "", landmark: "", pincode: "", refName: "", refMobile: "" });
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setForm({
      address: kyc.address || "",
      landmark: kyc.landmark || "",
      pincode: kyc.pincode || "",
      refName: kyc.refName || "",
      refMobile: kyc.refMobile || "",
    });
    setGps(kyc.lat != null && kyc.lng != null ? { lat: Number(kyc.lat), lng: Number(kyc.lng) } : null);
  }, [kyc]);

  const docs = DOCS[kind];
  const total = docs.length + 3 + (kind === "rider" ? 2 : 0);
  const done = Math.max(0, total - missing.length);
  const pct = Math.round((done / total) * 100);
  const status = kyc.status || "Incomplete";

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  function takeGps() {
    if (!navigator.geolocation) return setErr("GPS is not available on this device");
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const v = { lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) };
        setGps(v);
        void run("gps", () => onSave(v));
      },
      () => {
        setBusy(null);
        setErr("Allow location permission and try again (stand at your home door)");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:border-emerald-500 focus:outline-none";

  return (
    <div className="space-y-3">
      {/* Status + progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-extrabold text-slate-900">🪪 KYC for approval</div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${STATUS_STYLE[status] || STATUS_STYLE.Incomplete}`}>{status}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          {done}/{total} done{missing.length ? ` · missing: ${missing.join(", ")}` : " · all details added"}
        </div>
        {kyc.note && status === "Rejected" && <div className="mt-1 rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">Admin note: {kyc.note}</div>}
      </div>

      {/* Documents */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 text-[13px] font-extrabold text-slate-900">Documents</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {docs.map(([key, label]) => {
            const url = kyc[key as keyof Kyc] as string | undefined;
            return (
              <label key={key} className="group relative block cursor-pointer overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center hover:border-emerald-400">
                <div className="flex aspect-square items-center justify-center">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={label} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-slate-300">＋</span>
                  )}
                  {busy === key && <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-[11px] font-bold">Uploading…</span>}
                </div>
                <div className={`flex items-center justify-center gap-1 px-1 py-1 text-[10px] font-bold ${url ? "bg-emerald-50 text-emerald-700" : "bg-white text-rose-600"}`}>
                  {url ? "✓" : "✕"} {label}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture={key === "photo" ? "user" : "environment"}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void run(key, async () => onSave({ [key]: await upload(f) } as Partial<Kyc>));
                  }}
                />
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400">Tap a box to take a photo or choose a file. Make sure all text is readable.</p>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 text-[13px] font-extrabold text-slate-900">🏠 Home address</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="House no., street, area, city" className={`${input} sm:col-span-2`} />
          <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Landmark (near …)" className={input} />
          <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="Pincode" inputMode="numeric" className={input} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={takeGps} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${gps ? "border border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-slate-900 text-white"}`}>
            {busy === "gps" ? "Getting location…" : gps ? "📍 Update GPS location" : "📍 Add GPS location"}
          </button>
          {gps && (
            <a href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-700 underline">
              {gps.lat}, {gps.lng} (open map)
            </a>
          )}
        </div>
      </div>

      {/* Reference (riders) */}
      {kind === "rider" && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[13px] font-extrabold text-slate-900">👥 Local reference</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.refName} onChange={(e) => setForm({ ...form, refName: e.target.value })} placeholder="Reference name" className={input} />
            <input value={form.refMobile} onChange={(e) => setForm({ ...form, refMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Reference mobile (10 digits)" inputMode="numeric" className={input} />
          </div>
        </div>
      )}

      {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{err}</p>}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => void run("save", () => onSave(kind === "rider" ? form : { address: form.address, landmark: form.landmark, pincode: form.pincode }))}
          disabled={!!busy}
          className="rounded-xl border border-emerald-600 bg-white py-2.5 text-[13px] font-extrabold text-emerald-700 disabled:opacity-50"
        >
          {busy === "save" ? "Saving…" : "Save details"}
        </button>
        <button
          onClick={() => void run("submit", onSubmit)}
          disabled={!!busy || missing.length > 0 || status === "Submitted" || status === "Approved"}
          className="rounded-xl bg-emerald-600 py-2.5 text-[13px] font-extrabold text-white disabled:opacity-40"
        >
          {status === "Approved" ? "✓ Approved" : status === "Submitted" ? "Sent for approval" : "Submit for approval"}
        </button>
      </div>
    </div>
  );
}
