"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RiderLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rider-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.error || data.message || "Login failed");
        return;
      }
      localStorage.setItem("riderId", String(data.rider.id));
      router.push("/rider/dashboard");
    } catch {
      setMessage("Server connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rider-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || data.error || "Request failed");
      if (res.ok && data.success) setForgot(false);
    } catch {
      setMessage("Server connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-2xl text-white">F</div>
          <h1 className="text-2xl font-bold text-slate-900">Rider Login</h1>
          <p className="mt-1 text-sm text-slate-500">Fresh2Cook Delivery Partner</p>
        </div>

        {forgot ? (
          <form onSubmit={resetPassword} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Forgot Password?</h2>
            <p className="text-sm text-slate-600">Enter your registered mobile number. A temporary password will be sent by SMS.</p>
            <input required inputMode="tel" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Registered mobile number" className="w-full rounded-xl border p-3 outline-none focus:border-green-600" />
            <button disabled={busy} className="w-full rounded-xl bg-green-600 p-3 font-semibold text-white disabled:opacity-50">{busy ? "Please wait..." : "Send Temporary Password"}</button>
            <button type="button" onClick={() => { setForgot(false); setMessage(""); }} className="w-full text-sm text-slate-600 underline">Back to Login</button>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
            <input required inputMode="tel" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter registered mobile" className="w-full rounded-xl border p-3 outline-none focus:border-green-600" />
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full rounded-xl border p-3 outline-none focus:border-green-600" />
            <div className="text-right">
              <button type="button" onClick={() => { setForgot(true); setMessage(""); }} className="text-sm font-medium text-green-700 hover:underline">Forgot Password?</button>
            </div>
            <button disabled={busy} className="w-full rounded-xl bg-green-600 p-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">{busy ? "Logging in..." : "Login"}</button>
          </form>
        )}

        {message && <p role="status" className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}

        <div className="mt-6 border-t pt-5 text-center">
          <p className="text-sm text-slate-600">New Rider?</p>
          <Link href="/rider/register" className="mt-1 inline-block text-sm font-bold text-green-700 hover:underline">Register Here →</Link>
        </div>
      </section>
    </main>
  );
}
