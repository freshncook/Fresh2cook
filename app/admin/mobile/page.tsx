"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

/*
 * Admin > Open on mobile — scan the QR with your phone (same Wi-Fi) to test the website,
 * rider app and processing app on the phone while it runs on this computer.
 */

const PAGES = [
  ["Customer website", "/"],
  ["Rider app", "/rider/login"],
  ["Processing app", "/processing/login"],
  ["Admin", "/admin/login"],
];

export default function MobilePage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [page, setPage] = useState("/");
  const [pick, setPick] = useState(0);

  useEffect(() => {
    // Already opened from the internet (live site)? Use that address.
    if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
      setUrls([window.location.origin]);
      return;
    }
    fetch("/api/admin/lan-url", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error || "Could not read");
        setUrls(j.urls || []);
        if (!(j.urls || []).length) setErr("No Wi-Fi address found. Connect this computer to Wi-Fi (or a mobile hotspot).");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Could not read"));
  }, []);

  const base = urls[pick] || "";
  const full = base ? base + page : "";

  return (
    <div className="mx-auto max-w-4xl space-y-3 pb-10">
      <div>
        <h1 className="text-base font-extrabold text-slate-900">📱 Open on mobile</h1>
        <p className="text-[11px] text-slate-500">Test the website on your phone while it runs on this computer.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="mb-2 flex flex-wrap justify-center gap-1">
            {PAGES.map(([l, p]) => (
              <button key={p} onClick={() => setPage(p)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${page === p ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-200"}`}>
                {l}
              </button>
            ))}
          </div>
          {full ? (
            <>
              <div className="mx-auto w-fit rounded-2xl border-4 border-emerald-600 bg-white p-3">
                <QRCode value={full} size={200} />
              </div>
              <div className="mt-2 break-all rounded-lg bg-slate-100 px-2 py-1.5 font-mono text-[13px] font-bold text-slate-900">{full}</div>
              {urls.length > 1 && (
                <div className="mt-1.5 flex flex-wrap justify-center gap-1 text-[10px]">
                  {urls.map((u, i) => (
                    <button key={u} onClick={() => setPick(i)} className={`rounded px-1.5 py-0.5 ring-1 ${i === pick ? "bg-slate-900 text-white ring-slate-900" : "ring-slate-300"}`}>
                      {u.replace("http://", "")}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => navigator.clipboard?.writeText(full)} className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-[12px] font-bold text-slate-700">
                Copy link
              </button>
            </>
          ) : (
            <p className="py-10 text-[12px] text-slate-500">{err || "Finding this computer's Wi-Fi address…"}</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-700">
          <h2 className="mb-2 text-[14px] font-extrabold text-slate-900">How to open on your phone</h2>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Phone and this computer must be on the <b>same Wi-Fi</b>.</li>
            <li>Keep <code className="rounded bg-slate-100 px-1">npm run dev</code> running on the computer.</li>
            <li>Open the phone camera and scan the QR code (or type the link in Chrome).</li>
            <li>
              Not opening? On the computer: Windows asks <b>“Allow Node.js on networks?”</b> — tick <b>Private networks</b> and press <b>Allow</b>. If you missed it, run the
              script <code className="rounded bg-slate-100 px-1">Fresh2Cook-Mobile.ps1</code> once as Administrator.
            </li>
          </ol>
          <div className="mt-3 rounded-xl bg-amber-50 p-2.5 text-[12px] text-amber-900 ring-1 ring-amber-200">
            <b>Note:</b> on this test link (http), the phone does not allow <b>GPS location</b> — the “Add GPS location” button works only on the live website (https) or on
            this computer. Everything else (login, cart, orders, rider tasks, photos) works.
          </div>
        </section>
      </div>
    </div>
  );
}
