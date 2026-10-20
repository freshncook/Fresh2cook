"use client";

const portals = [
  { title: "Customer App", detail: "Shop fresh products and manage orders.", href: "/customer/login", tag: "SHOP", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  { title: "Packer App", detail: "Pick, check, pack and prepare orders.", href: "/packer/login", tag: "PACK", color: "border-blue-200 bg-blue-50 text-blue-800" },
  { title: "Delivery App", detail: "Accept assignments and complete deliveries.", href: "/rider/login", tag: "DELIVER", color: "border-orange-200 bg-orange-50 text-orange-800" },
  { title: "Admin Portal", detail: "Manage operations, staff and approvals.", href: "/admin/login", tag: "ADMIN", color: "border-violet-200 bg-violet-50 text-violet-800" },
];

export default function PortalsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-700">FRESH2COOK WORKSPACE</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Choose your application</h1>
            <p className="mt-1 text-sm text-slate-500">One platform. Four focused workspaces.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">4 Applications</span>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {portals.map((portal) => (
            <a key={portal.href} href={portal.href} className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:p-5">
              <span className={`flex h-12 min-w-12 items-center justify-center rounded-xl border text-xs font-extrabold ${portal.color}`}>
                {portal.tag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{portal.title}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">{portal.detail}</span>
                <span className="mt-3 inline-block text-sm font-bold text-emerald-700">Open application →</span>
              </span>
            </a>
          ))}
        </section>
        <p className="mt-5 text-xs text-slate-400">Access is controlled by each application’s sign-in service and permissions.</p>
      </div>
    </main>
  );
}
