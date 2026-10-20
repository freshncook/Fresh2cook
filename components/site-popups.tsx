"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Two popups when the home page opens (Admin > Refer & Popups can change / switch off):
 *   1. Offer banner
 *   2. Refer a friend — only 3 things: friend's name, mobile, pincode
 * Shown once per session / day / week (admin setting). Not shown again after a referral today.
 */

export type PopupSettings = {
  offer: { on: boolean; image: string; title: string; text: string; button: string; link: string };
  refer: { on: boolean; title: string; text: string };
  frequency: string;
};

type Me = { name: string; code: string } | null;

const SEEN = "f2c_popups_seen";
const PENDING = "f2c_pending_refer";
const WAIT: Record<string, number> = { day: 86400000, week: 7 * 86400000 };

function seenRecently(freq: string) {
  try {
    if (freq === "session") return sessionStorage.getItem(SEEN) === "1";
    const t = Number(localStorage.getItem(SEEN) || 0);
    return Date.now() - t < (WAIT[freq] || WAIT.day);
  } catch {
    return false;
  }
}
function markSeen(freq: string) {
  try {
    if (freq === "session") sessionStorage.setItem(SEEN, "1");
    else localStorage.setItem(SEEN, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export default function SitePopups({
  popups,
  me,
  meLoaded,
  welcome,
  reward,
  openReferSignal,
}: {
  popups?: PopupSettings | null;
  me: Me;
  meLoaded: boolean;
  welcome: number;
  reward: number;
  openReferSignal: number;
}) {
  const [show, setShow] = useState<"offer" | "refer" | null>(null);
  const started = useRef(false);

  // Auto-open once settings are loaded
  useEffect(() => {
    if (!popups || !meLoaded || started.current) return;
    started.current = true;
    let pending = false;
    try {
      pending = Boolean(localStorage.getItem(PENDING));
    } catch {
      /* ignore */
    }
    if (pending && me) {
      setShow("refer"); // came back after login — finish the referral
      return;
    }
    if (seenRecently(popups.frequency)) return;
    const t = window.setTimeout(() => {
      if (popups.offer.on) setShow("offer");
      else if (popups.refer.on) setShow("refer");
      markSeen(popups.frequency);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [popups, me, meLoaded]);

  // "Refer a friend" button on the page
  useEffect(() => {
    if (openReferSignal > 0) setShow("refer");
  }, [openReferSignal]);

  // close on Esc
  useEffect(() => {
    if (!show) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function close() {
    if (show === "offer" && popups?.refer.on) {
      setShow(null);
      window.setTimeout(() => setShow("refer"), 450);
      return;
    }
    setShow(null);
  }

  if (!show || !popups) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={close} role="dialog" aria-modal="true">
      <div
        className="relative w-full max-w-[420px] animate-[f2cPop_.25s_ease-out] overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes f2cPop{from{transform:translateY(24px) scale(.97);opacity:0}to{transform:none;opacity:1}}`}</style>
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-[16px] font-bold text-white backdrop-blur hover:bg-black/60"
        >
          ✕
        </button>
        {show === "offer" ? <OfferPopup p={popups.offer} onGo={() => setShow(null)} /> : <ReferPopup p={popups.refer} me={me} welcome={welcome} reward={reward} onDone={() => setShow(null)} />}
      </div>
    </div>
  );
}

function OfferPopup({ p, onGo }: { p: PopupSettings["offer"]; onGo: () => void }) {
  return (
    <div>
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt={p.title || "Offer"} className="block max-h-[52vh] w-full bg-emerald-50 object-cover" />
      ) : (
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-500 to-lime-400">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
          <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-yellow-300/30" />
          <div className="text-center text-white">
            <div className="text-[54px] leading-none drop-shadow">🥬🍅🥕</div>
            <div className="mt-2 inline-block rounded-full bg-yellow-300 px-3 py-0.5 text-[12px] font-black text-slate-900 shadow">TODAY&apos;S OFFER</div>
          </div>
        </div>
      )}
      <div className="p-4 text-center">
        {p.title && <h3 className="text-[19px] font-black leading-tight text-slate-900">{p.title}</h3>}
        {p.text && <p className="mt-1 text-[13px] leading-snug text-slate-600">{p.text}</p>}
        <a
          href={p.link || "/products"}
          onClick={onGo}
          className="mt-3 block rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 py-3 text-[15px] font-extrabold text-white shadow-lg shadow-emerald-200"
        >
          {p.button || "Shop now"} →
        </a>
      </div>
    </div>
  );
}

function ReferPopup({ p, me, welcome, reward, onDone }: { p: PopupSettings["refer"]; me: Me; welcome: number; reward: number; onDone: () => void }) {
  const [form, setForm] = useState({ friendName: "", friendMobile: "", pincode: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ friendName: string; friendMobile: string; code: string; served: boolean } | null>(null);
  const auto = useRef(false);

  // finish a referral started before login
  useEffect(() => {
    if (auto.current || !me) return;
    try {
      const raw = localStorage.getItem("f2c_pending_refer");
      if (!raw) return;
      auto.current = true;
      const saved = JSON.parse(raw);
      localStorage.removeItem("f2c_pending_refer");
      setForm(saved);
      void submit(saved);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  async function submit(values = form) {
    setErr("");
    if (values.friendName.trim().length < 2) return setErr("Enter your friend's name");
    if (!/^[6-9]\d{9}$/.test(values.friendMobile)) return setErr("Enter a valid 10-digit mobile number");
    if (!/^\d{6}$/.test(values.pincode)) return setErr("Enter a 6-digit pincode");
    if (!me) {
      try {
        localStorage.setItem("f2c_pending_refer", JSON.stringify(values));
      } catch {
        /* ignore */
      }
      window.location.href = "/login?next=/";
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/referral-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.error || "Could not save. Please try again.");
      setDone({ friendName: values.friendName, friendMobile: values.friendMobile, code: j.code, served: j.servedPincode });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[14px] font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  if (done) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const first = done.friendName.split(" ")[0];
    const msg = `Hi ${first}! 🥬 Try Fresh2Cook — fresh vegetables & fruits, cleaned and ready to cook, delivered home.\nUse my code *${done.code}* and get ₹${welcome} in your wallet 👇\n${origin}/r/${done.code}`;
    return (
      <div className="p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[32px]">🎉</div>
        <h3 className="mt-2 text-[18px] font-black text-slate-900">{first} has been added!</h3>
        <p className="mt-1 text-[13px] text-slate-600">
          When {first} places the first order, {first} gets <b className="text-emerald-700">₹{welcome}</b> and you get <b className="text-violet-700">₹{reward}</b> after delivery.
        </p>
        {!done.served && <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">We don&apos;t deliver to this pincode yet — we&apos;ll let them know when we start.</p>}
        <a
          href={`https://wa.me/91${done.friendMobile}?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block rounded-xl bg-[#25D366] py-3 text-[14px] font-extrabold text-white shadow"
        >
          💬 Send invite to {first} on WhatsApp
        </a>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setDone(null);
              setForm({ friendName: "", friendMobile: "", pincode: "" });
            }}
            className="rounded-xl border border-violet-300 py-2 text-[13px] font-bold text-violet-700"
          >
            + Refer another
          </button>
          <button onClick={onDone} className="rounded-xl bg-slate-100 py-2 text-[13px] font-bold text-slate-700">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-5 pb-5 pt-6 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-fuchsia-300/30 blur-xl" />
        <div className="text-[34px] leading-none">🎁</div>
        <h3 className="mt-1 text-[20px] font-black leading-tight">{p.title || "Refer a friend & earn"}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-900">💰 You get ₹{reward}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-violet-800">🎉 Friend gets ₹{welcome}</span>
        </div>
      </div>
      <form
        className="space-y-2.5 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {p.text && <p className="text-[12px] leading-snug text-slate-600">{p.text}</p>}
        <input value={form.friendName} onChange={(e) => setForm({ ...form, friendName: e.target.value })} placeholder="Friend's name" autoComplete="off" className={input} />
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2.5 text-[14px] font-bold text-slate-600">+91</span>
          <input
            value={form.friendMobile}
            onChange={(e) => setForm({ ...form, friendMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="Friend's mobile number"
            inputMode="numeric"
            className={input}
          />
        </div>
        <input
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          placeholder="Friend's pincode"
          inputMode="numeric"
          className={input}
        />
        {err && <p className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[12px] font-semibold text-rose-700">{err}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-[15px] font-extrabold text-white shadow-lg shadow-violet-200 disabled:opacity-60">
          {busy ? "Saving…" : me ? "Refer my friend" : "Log in & refer"}
        </button>
        {!me && <p className="text-center text-[11px] text-slate-500">Log in so we can add the reward to your wallet.</p>}
      </form>
    </div>
  );
}
