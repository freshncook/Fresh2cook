"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RiderRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", mobile: "", password: "", vehicle: "", address: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rider-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.error || data.message || "Registration failed");
        return;
      }
      setMessage("Registration submitted. Your account is pending approval.");
      setTimeout(() => router.push("/rider/login"), 1800);
    } catch {
      setMessage("Server connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">New Rider Registration</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Register as a Fresh2Cook delivery partner.</p>
        <form onSubmit={submit} className="space-y-4">
          <input required name="name" value={form.name} onChange={update} placeholder="Full name" className="w-full rounded-xl border p-3" />
          <input required name="mobile" inputMode="tel" value={form.mobile} onChange={update} placeholder="Mobile number" className="w-full rounded-xl border p-3" />
          <input required minLength={6} name="password" type="password" autoComplete="new-password" value={form.password} onChange={update} placeholder="Create password (min. 6 characters)" className="w-full rounded-xl border p-3" />
          <select required name="vehicle" value={form.vehicle} onChange={update} className="w-full rounded-xl border bg-white p-3">
            <option value="">Select vehicle type</option>
            <option value="Bicycle">Bicycle</option>
            <option value="Bike">Motorcycle / Scooter</option>
            <option value="Electric Bike">Electric Bike</option>
            <option value="Other">Other</option>
          </select>
          <input name="address" value={form.address} onChange={update} placeholder="Address (optional)" className="w-full rounded-xl border p-3" />
          <button disabled={busy} className="w-full rounded-xl bg-green-600 p-3 font-semibold text-white disabled:opacity-50">{busy ? "Submitting..." : "Submit Registration"}</button>
        </form>
        {message && <p role="status" className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
        <p className="mt-5 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-green-700 hover:underline" href="/rider/login">Back to Login</Link></p>
      </section>
    </main>
  );
}
