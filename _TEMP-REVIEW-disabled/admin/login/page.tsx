"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
} from "lucide-react";

export default function AdminLoginPage() {
  const [setupMode, setSetupMode] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const endpoint = setupMode
        ? "/api/auth/staff-setup"
        : "/api/auth/staff-login";

      const body = setupMode
        ? {
            name,
            mobile,
            password,
            role: "SUPER_ADMIN",
          }
        : {
            mobile,
            password,
            role: "SUPER_ADMIN",
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (
          !setupMode &&
          data.code === "NO_ACCOUNT"
        ) {
          setSetupMode(true);
        }

        throw new Error(
          data.message ||
            "Unable to continue"
        );
      }

      window.location.href = "/admin";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">

        <div className="w-full rounded-xl border border-slate-200 bg-white p-7 shadow-xl">

          <div className="mb-7 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={34} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Super Admin
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {setupMode
                ? "Create the first Super Admin account"
                : "Secure admin login"}
            </p>

          </div>

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            {setupMode && (
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Full Name"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500"
              />
            )}

            <input
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              placeholder="Mobile Number"
              inputMode="numeric"
              className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500"
            />

            <div className="relative">

              <input
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {message && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={19}
                />
              ) : setupMode ? (
                <UserPlus size={19} />
              ) : (
                <ShieldCheck size={19} />
              )}

              {loading
                ? "Please wait..."
                : setupMode
                  ? "Create Super Admin"
                  : "Login"}
            </button>

          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setSetupMode(
                  (value) => !value
                );
                setMessage("");
              }}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              {setupMode
                ? "Back to Login"
                : "First time setup"}
            </button>
          </div>

          <div className="mt-6 border-t pt-5 text-center text-xs text-slate-400">
            Processing Team Login:{" "}
            <a
              className="font-semibold text-emerald-700"
              href="/processing/login"
            >
              /processing/login
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}







