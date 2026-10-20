"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const GROUP_LABEL: Record<string, string> = {
  admin: "Admin",
  processing: "Processing",
  rider: "Rider app",
  delivery: "Delivery",
  customer: "Customer",
  account: "Customer account",
  ai: "AI tools",
  "": "Shop (storefront)",
};

const PINNED = ["/admin", "/admin/orders", "/admin/settings", "/processing/dashboard", "/rider/my-tasks", "/rider/pickup-order", "/account", "/track-order"];

function label(route: string) {
  const last = route.split("/").filter(Boolean).pop() || "home";
  return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AllPagesList({ routes }: { routes: string[] }) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const k = q.trim().toLowerCase();
    const map = new Map<string, string[]>();
    for (const r of routes) {
      if (k && !r.toLowerCase().includes(k)) continue;
      const top = r.split("/").filter(Boolean)[0] || "";
      const key = GROUP_LABEL[top] !== undefined ? top : "";
      const list = map.get(key) || [];
      list.push(r);
      map.set(key, list);
    }
    const order = ["admin", "processing", "rider", "delivery", "customer", "account", "ai", ""];
    return order.filter((g) => map.has(g)).map((g) => ({ key: g, routes: map.get(g)! }));
  }, [routes, q]);

  const pinned = PINNED.filter((p) => routes.includes(p));

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-base font-bold text-slate-900">All Pages</h1>
        <p className="text-[11px] text-slate-500">
          {routes.length} pages · open any page from here. Admin login works for Processing; rider pages need a rider login.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {pinned.map((p) => (
          <Link key={p} href={p} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-800">
            {label(p)} <span className="font-normal text-emerald-600">{p}</span>
          </Link>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search pages… (e.g. rider, wallet, orders)"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <section key={g.key || "shop"} className="rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <h2 className="text-[13px] font-semibold text-slate-800">{GROUP_LABEL[g.key] ?? g.key}</h2>
              <span className="text-[11px] text-slate-400">{g.routes.length}</span>
            </header>
            <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
              {g.routes.map((r) => {
                const dynamicRoute = r.includes("[");
                return (
                  <li key={r}>
                    {dynamicRoute ? (
                      <span className="flex justify-between px-3 py-1.5 text-[12px] text-slate-400" title="Needs an ID — open it from its list page">
                        {label(r)} <span className="font-mono text-[10px]">{r}</span>
                      </span>
                    ) : (
                      <Link href={r} className="flex justify-between gap-2 px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50">
                        <span className="truncate font-medium">{label(r)}</span>
                        <span className="shrink-0 font-mono text-[10px] text-slate-400">{r}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
