"use client";

import { useEffect, useState } from "react";

/*
 * Admin login. If no admin account exists yet, the same page lets the
 * owner create the first admin (one time only).
 */

export default function AdminLoginPage() {
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin-login", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.loggedIn) {
          window.location.replace(new URLSearchParams(window.location.search).get("next") || "/admin");
          return;
        }
        setHasAdmin(Boolean(j.hasAdmin));
      })
      .catch(() => setHasAdmin(true));
  }, []);

  const setup = hasAdmin === false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup ? { action: "setup", name, mobile, password } : { mobile, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || "Login failed");
      window.location.assign(new URLSearchParams(window.location.search).get("next") || j.redirectTo || "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div className="text-[15px] font-extrabold text-emerald-700">
            Fresh2Cook <span className="text-slate-400">Admin</span>
          </div>
          <h1 className="mt-2 text-lg font-bold text-slate-900">{setup ? "Create admin account" : "Admin login"}</h1>
          <p className="text-[12px] text-slate-500">
            {setup ? "First time: set your name, mobile and password." : "Log in with your mobile number and password."}
          </p>
        </div>

        {hasAdmin === null ? (
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <div className="space-y-3">
            {setup && (
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-slate-700">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">Mobile number</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm tabular-nums focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={setup ? "new-password" : "current-password"}
                required
                minLength={setup ? 6 : 1}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "Please wait…" : setup ? "Create & login" : "Login"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
