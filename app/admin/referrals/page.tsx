"use client";

import { useEffect, useMemo, useState } from "react";

/*
 * Admin > Refer & Popups
 *   - Offer banner popup + Refer-a-friend popup (on/off, picture, text, how often)
 *   - Refer & Earn reward amounts
 *   - Everyone customers referred (name, mobile, pincode) with live status
 */

type S = {
  popupOfferOn: string;
  popupOfferImage: string;
  popupOfferTitle: string;
  popupOfferText: string;
  popupOfferButton: string;
  popupOfferLink: string;
  popupReferOn: string;
  popupReferTitle: string;
  popupReferText: string;
  popupFrequency: string;
  referralReward: number;
  referralWelcome: number;
};
const KEYS: (keyof S)[] = [
  "popupOfferOn",
  "popupOfferImage",
  "popupOfferTitle",
  "popupOfferText",
  "popupOfferButton",
  "popupOfferLink",
  "popupReferOn",
  "popupReferTitle",
  "popupReferText",
  "popupFrequency",
  "referralReward",
  "referralWelcome",
];

type Lead = {
  id: string;
  at: number;
  friendName: string;
  friendMobile: string;
  pincode: string;
  referrerName: string;
  referrerMobile: string;
  referrerCode: string;
  status: string;
  orders: number;
  earned: number;
  note?: string;
};

const pick = (o: Record<string, unknown>) => Object.fromEntries(KEYS.map((k) => [k, o[k] ?? ""])) as unknown as S;

export default function ReferralsAdminPage() {
  const [saved, setSaved] = useState<S | null>(null);
  const [form, setForm] = useState<S | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState({ total: 0, joined: 0, paid: 0, rewardPaid: 0 });
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<"offer" | "refer">("offer");

  useEffect(() => {
    fetch("/api/store-settings?all=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error || "Could not load");
        setSaved(pick(j.settings));
        setForm(pick(j.settings));
      })
      .catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load" }));
    loadLeads();
  }, []);

  function loadLeads() {
    fetch("/api/referral-leads", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) return;
        setLeads(j.leads || []);
        setSummary(j.summary);
      })
      .catch(() => undefined);
  }

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const set = (k: keyof S, v: string | number) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function save() {
    if (!form) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/store-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || "Save failed");
      setSaved(pick(j.settings));
      setForm(pick(j.settings));
      setMsg({ ok: true, text: "Saved. Customers will see the new popups on their next visit." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload-file", { method: "POST", body: fd });
      const j = await r.json();
      if (!j.url) throw new Error(j.error || "Upload failed");
      set("popupOfferImage", j.url);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function removeLead(id: string) {
    if (!window.confirm("Remove this referral?")) return;
    await fetch("/api/referral-leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, remove: true }) });
    loadLeads();
  }

  function exportCsv() {
    const rows = [["Date", "Friend", "Friend mobile", "Pincode", "Referred by", "Referrer mobile", "Code", "Status", "Reward paid"], ...leads.map((l) => [new Date(l.at).toLocaleDateString("en-IN"), l.friendName, l.friendMobile, l.pincode, l.referrerName, l.referrerMobile, l.referrerCode, l.status, l.earned])];
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "fresh2cook-referrals.csv";
    a.click();
  }

  const shown = leads.filter((l) => !q || `${l.friendName} ${l.friendMobile} ${l.pincode} ${l.referrerName} ${l.referrerMobile}`.toLowerCase().includes(q.toLowerCase()));
  const input = "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-emerald-500";

  if (!form) return <div className="h-40 animate-pulse rounded-xl bg-slate-200/60">{msg && <p className="p-3 text-[12px] text-rose-700">{msg.text}</p>}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-3 pb-6">
      <div>
        <h1 className="text-base font-extrabold text-slate-900">🎁 Refer &amp; Earn · Popups</h1>
        <p className="text-[11px] text-slate-500">Two popups show when a customer opens the home page: 1. Offer banner, 2. Refer a friend (name, mobile, pincode).</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["Friends referred", summary.total, "text-violet-700"],
          ["Placed an order", summary.joined, "text-blue-700"],
          ["Reward paid", summary.paid, "text-emerald-700"],
          ["Paid to referrers", "₹" + summary.rewardPaid, "text-emerald-700"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{l}</div>
            <div className={`text-[20px] font-black ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {/* Offer popup */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-[13px] font-extrabold text-slate-800">1 · Offer banner popup</span>
              <Toggle on={form.popupOfferOn !== "0"} onChange={(v) => set("popupOfferOn", v ? "1" : "0")} />
            </header>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className="text-[12px] font-semibold text-slate-700">Banner picture</span>
                <div className="mt-1 flex items-center gap-2">
                  {form.popupOfferImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.popupOfferImage} alt="" className="h-16 w-28 rounded-lg border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] text-slate-400">No picture</div>
                  )}
                  <label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-white">
                    {uploading ? "Uploading…" : "Upload"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
                  </label>
                  {form.popupOfferImage && (
                    <button onClick={() => set("popupOfferImage", "")} className="text-[12px] font-semibold text-rose-600">
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">Best size 800 × 600 px. Without a picture a green Fresh2Cook card is shown.</p>
              </div>
              <Field label="Title"><input value={form.popupOfferTitle} onChange={(e) => set("popupOfferTitle", e.target.value)} className={input} /></Field>
              <Field label="Button text"><input value={form.popupOfferButton} onChange={(e) => set("popupOfferButton", e.target.value)} className={input} /></Field>
              <Field label="Text" wide><textarea rows={2} value={form.popupOfferText} onChange={(e) => set("popupOfferText", e.target.value)} className={input} /></Field>
              <Field label="Button opens" wide>
                <input value={form.popupOfferLink} onChange={(e) => set("popupOfferLink", e.target.value)} placeholder="/products  or  /products?category=Fruits" className={input} />
              </Field>
            </div>
          </section>

          {/* Refer popup */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-[13px] font-extrabold text-slate-800">2 · Refer-a-friend popup</span>
              <Toggle on={form.popupReferOn !== "0"} onChange={(v) => set("popupReferOn", v ? "1" : "0")} />
            </header>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
              <Field label="Title" wide><input value={form.popupReferTitle} onChange={(e) => set("popupReferTitle", e.target.value)} className={input} /></Field>
              <Field label="Text" wide><textarea rows={2} value={form.popupReferText} onChange={(e) => set("popupReferText", e.target.value)} className={input} /></Field>
              <Field label="Referrer gets (₹, after friend's first delivery)">
                <input type="number" min={0} value={form.referralReward} onChange={(e) => set("referralReward", Number(e.target.value || 0))} className={input} />
              </Field>
              <Field label="Friend gets (₹, welcome bonus)">
                <input type="number" min={0} value={form.referralWelcome} onChange={(e) => set("referralWelcome", Number(e.target.value || 0))} className={input} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[12px] font-semibold text-slate-700">Show popups to the same customer</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[
                ["session", "Every visit"],
                ["day", "Once a day"],
                ["week", "Once a week"],
              ].map(([k, l]) => (
                <button key={k} onClick={() => set("popupFrequency", k)} className={`rounded-full px-3 py-1 text-[12px] font-bold ring-1 ${form.popupFrequency === k ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-200"}`}>
                  {l}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Preview */}
        <aside className="h-fit space-y-2 lg:sticky lg:top-20">
          <div className="flex gap-1.5">
            {(["offer", "refer"] as const).map((k) => (
              <button key={k} onClick={() => setPreview(k)} className={`flex-1 rounded-lg py-1.5 text-[12px] font-bold ${preview === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
                Preview {k === "offer" ? "1 · Offer" : "2 · Refer"}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            {preview === "offer" ? (
              <>
                {form.popupOfferImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.popupOfferImage} alt="" className="block max-h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-emerald-700 via-emerald-500 to-lime-400 text-[44px]">🥬🍅🥕</div>
                )}
                <div className="p-3 text-center">
                  <div className="text-[16px] font-black">{form.popupOfferTitle}</div>
                  <div className="mt-0.5 text-[12px] text-slate-600">{form.popupOfferText}</div>
                  <div className="mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 py-2 text-[13px] font-extrabold text-white">{form.popupOfferButton || "Shop now"} →</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-4 text-white">
                  <div className="text-[28px]">🎁</div>
                  <div className="text-[16px] font-black">{form.popupReferTitle}</div>
                  <div className="mt-1 flex gap-1 text-[10px] font-bold">
                    <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-900">You get ₹{form.referralReward}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-violet-800">Friend gets ₹{form.referralWelcome}</span>
                  </div>
                </div>
                <div className="space-y-1.5 p-3">
                  <div className="text-[11px] text-slate-600">{form.popupReferText}</div>
                  {["Friend's name", "Friend's mobile number", "Friend's pincode"].map((p) => (
                    <div key={p} className="rounded-lg border border-slate-300 px-2 py-1.5 text-[12px] text-slate-400">{p}</div>
                  ))}
                  <div className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-center text-[13px] font-extrabold text-white">Refer my friend</div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Leads */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
          <span className="text-[13px] font-extrabold text-slate-800">👥 Referred friends</span>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, pincode" className="w-48 rounded-lg border border-slate-300 px-2 py-1 text-[12px]" />
            <button onClick={exportCsv} className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700">
              ⬇ CSV
            </button>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-1.5">Date</th>
                <th className="px-2 py-1.5">Friend</th>
                <th className="px-2 py-1.5">Pincode</th>
                <th className="px-2 py-1.5">Referred by</th>
                <th className="px-2 py-1.5">Status</th>
                <th className="px-3 py-1.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-500">{new Date(l.at).toLocaleDateString("en-IN")}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-bold text-slate-900">{l.friendName}</div>
                    <div className="text-[11px] text-slate-500">{l.friendMobile}</div>
                  </td>
                  <td className="px-2 py-1.5">{l.pincode}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-semibold">{l.referrerName}</div>
                    <div className="text-[11px] text-slate-500">
                      {l.referrerMobile} · {l.referrerCode}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                        l.status === "Reward paid" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : l.status === "Invited" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-blue-50 text-blue-700 ring-blue-200"
                      }`}
                    >
                      {l.status}
                      {l.earned ? ` · ₹${l.earned}` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <a
                      href={`https://wa.me/91${l.friendMobile}?text=${encodeURIComponent(`Hi ${l.friendName.split(" ")[0]}! ${l.referrerName.split(" ")[0]} has invited you to Fresh2Cook 🥬 Use code ${l.referrerCode} and get ₹${form.referralWelcome} in your wallet: ${typeof window !== "undefined" ? window.location.origin : ""}/r/${l.referrerCode}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-1 rounded-md bg-[#25D366] px-2 py-1 text-[11px] font-bold text-white"
                    >
                      WhatsApp
                    </a>
                    <button onClick={() => void removeLead(l.id)} className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    No referrals yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-0 z-30 -mx-3 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[12px] ${msg ? (msg.ok ? "font-semibold text-emerald-700" : "font-semibold text-rose-700") : "text-slate-500"}`}>
            {msg ? msg.text : dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button onClick={() => void save()} disabled={!dirty || busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-emerald-600" : "bg-slate-300"}`} aria-pressed={on}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
      <span className="sr-only">{on ? "On" : "Off"}</span>
    </button>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[12px] font-semibold text-slate-700">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
