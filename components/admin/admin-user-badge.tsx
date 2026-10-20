"use client";

import { useEffect, useState } from "react";

/* Shows who is logged in as admin, with Login / Logout. */
export default function AdminUserBadge() {
  const [admin, setAdmin] = useState<{ name: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/admin-login", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setAdmin(j.loggedIn ? j.admin : null))
      .catch(() => setAdmin(null));
  }, []);

  if (admin === undefined) return <span className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />;

  if (!admin) {
    return (
      <a href="/admin/login" className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
        Admin login
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline">👤 {admin.name}</span>
      <button
        onClick={async () => {
          await fetch("/api/admin-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
          }).catch(() => undefined);
          window.location.assign("/admin/login");
        }}
        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        Logout
      </button>
    </div>
  );
}
