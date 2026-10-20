"use client";

export const dynamic = "force-dynamic";

export default function QRMenuPage() {
  const modules=[
    ["/admin/orders","Orders","Manage incoming D2C orders."],
    ["/admin/products","Products","Manage the Fresh2Cook catalogue."],
    ["/admin/customers","Customers","View customer CRM records."],
    ["/admin/reports","Reports","Review sales and business reports."],
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="QR Ordering" subtitle="QR Menu and D2C ordering control center." />

        <div className="mb-7 rounded-xl bg-gradient-to-r from-[#063f3d] to-[#159447] p-8 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-100">Fresh2Cook Digital Menu</p>
          <h2 className="mt-2 text-3xl font-extrabold">QR Menu & D2C Orders</h2>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50">Connect customers from QR codes to your product catalogue and ordering workflow.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([href,title,text])=>(
            <a key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">â†—</div>
              <h2 className="mt-5 font-extrabold text-[#123b38]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}






