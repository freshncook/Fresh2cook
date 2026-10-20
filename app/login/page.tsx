"use client";

import { useEffect, useState } from "react";

/*
 * Customer Login / Sign Up (mobile + password).
 * /login?ref=CODE opens Sign Up with the referral code filled in.
 */

export default function CustomerLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState("/account");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = p.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setMode("signup");
    }
    // Invite link (/r/CODE) saves the code in a cookie — fill it in automatically
    if (!ref) {
      const fromCookie = document.cookie.split("; ").find((c) => c.startsWith("f2c_ref="))?.split("=")[1];
      if (fromCookie) setReferralCode(decodeURIComponent(fromCookie).toUpperCase());
    }
    const n = p.get("next");
    if (n && n.startsWith("/")) setNext(n);
    try {
      const saved = localStorage.getItem("freshcut-phone");
      if (saved) setMobile(saved.replace(/\D/g, "").slice(-10));
    } catch {
      /* ignore */
    }
    // Already logged in? go straight to account
    fetch("/api/customer-account", { cache: "no-store" })
      .then((r) => (r.ok ? window.location.replace(n && n.startsWith("/") ? n : "/account") : null))
      .catch(() => null);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/customer-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? { action: "signup", name, mobile, password, referralCode } : { action: "login", mobile, password }
        ),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || "Please try again");
      try {
        // Checkout reads these to pre-fill the form
        localStorage.setItem("freshcut-customer", j.name || name);
        localStorage.setItem("freshcut-phone", j.mobile || mobile);
        localStorage.setItem("freshcut-login", "true");
      } catch {
        /* ignore */
      }
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-start justify-center bg-slate-50 px-4 py-6 sm:items-center">
      <div className="w-full max-w-sm">
        <div className="mb-3 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 text-[13px] font-semibold">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`rounded-lg py-2 ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              {m === "login" ? "Login" : "New account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-[17px] font-bold text-slate-900">{mode === "login" ? "Welcome back 👋" : "Create your account"}</h1>
            <p className="text-[12px] text-slate-500">
              {mode === "login" ? "Orders, wallet and Refer & Earn in one place." : "For order history, reorder, wallet and referral rewards."}
            </p>
          </div>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className={input} />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-700">Mobile number</span>
            <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
              <span className="pl-3 text-[14px] text-slate-500">+91</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                autoComplete="tel"
                required
                className="w-full min-w-0 rounded-lg bg-transparent px-2 py-2.5 text-[14px] tabular-nums outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 flex justify-between text-[12px] font-semibold text-slate-700">
              Password
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="font-normal text-emerald-700">
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 6 : 1}
              required
              className={input}
            />
            {mode === "signup" && <span className="mt-0.5 block text-[11px] text-slate-500">At least 6 characters</span>}
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">
                Referral code <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <input value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase().slice(0, 12))} className={`${input} uppercase tracking-wider`} />
            </label>
          )}

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}

          <button disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </button>

          {mode === "login" && (
            <p className="text-center text-[11px] text-slate-500">
              Forgot password? Contact support — the WhatsApp button is below.
            </p>
          )}
        </form>

        <p className="mt-3 text-center text-[12px] text-slate-500">
          Just want to track an order?{" "}
          <a href="/track-order" className="font-semibold text-emerald-700">
            Track without login
          </a>
        </p>
      </div>
    </div>
  );
}
