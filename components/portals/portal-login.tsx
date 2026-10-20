"use client";

import { useState } from "react";

type PortalRole = "customer" | "packer" | "rider" | "admin";

const config: Record<PortalRole, {
  title: string;
  subtitle: string;
  accent: string;
  api: string;
  home: string;
}> = {
  customer: {
    title: "Customer App",
    subtitle: "Fresh groceries, delivered fresh.",
    accent: "emerald",
    api: "/api/customer-login",
    home: "/",
  },
  packer: {
    title: "Packer App",
    subtitle: "Manage picking, packing and order readiness.",
    accent: "blue",
    api: "/api/packer-login",
    home: "/packer/dashboard",
  },
  rider: {
    title: "Delivery App",
    subtitle: "Manage deliveries and complete orders.",
    accent: "orange",
    api: "/api/rider-login",
    home: "/rider/dashboard",
  },
  admin: {
    title: "Admin Portal",
    subtitle: "Manage operations, orders and team access.",
    accent: "violet",
    api: "/api/admin-login",
    home: "/admin",
  },
};

export default function PortalLogin({ role }: { role: PortalRole }) {
  const item = config[role];
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch(item.api, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false || data.error) {
        throw new Error(
          data.error || data.message ||
          `Login API unavailable (${response.status}).`
        );
      }

      window.location.assign(data.redirectTo || data.redirect || item.home);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const theme: Record<PortalRole, string> = {
    customer: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200",
    packer: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200",
    rider: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-200",
    admin: "bg-violet-600 hover:bg-violet-700 focus:ring-violet-200",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 text-slate-900">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
          <a href="/portals" className="text-sm font-bold tracking-tight text-emerald-700">
            Fresh2Cook <span className="font-normal text-slate-400">/ Workspace</span>
          </a>
          <div className="mt-5 flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
              role === "customer" ? "bg-emerald-50 text-emerald-700" :
              role === "packer" ? "bg-blue-50 text-blue-700" :
              role === "rider" ? "bg-orange-50 text-orange-700" :
              "bg-violet-50 text-violet-700"
            }`}>
              {role === "customer" ? "C" : role === "packer" ? "P" : role === "rider" ? "R" : "A"}
            </div>
            <div>
              <h1 className="text-xl font-bold">{item.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 px-5 py-5 sm:px-7">
          <div>
            <label htmlFor="mobile" className="mb-1.5 block text-sm font-semibold">Mobile number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              autoComplete="username"
              inputMode="tel"
              required
              minLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter registered mobile"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${theme[role]}`}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>

          {role === "customer" && (
            <p className="text-center text-sm text-slate-500">
              New customer? <a href="/register" className="font-semibold text-emerald-700">Create account</a>
            </p>
          )}

          {role === "rider" && (
            <p className="text-center text-sm text-slate-500">
              New rider? <a href="/rider/register" className="font-semibold text-orange-700">Register here</a>
            </p>
          )}

          <a href="/portals" className="block py-1 text-center text-sm font-medium text-slate-500 hover:text-slate-900">
            ← All applications
          </a>
        </form>
      </section>
    </main>
  );
}
