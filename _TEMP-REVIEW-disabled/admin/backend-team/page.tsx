"use client";

export const dynamic = "force-dynamic";

export default function BackendTeamPage() {
  const modules = [
    ["Order Processing", "Manage incoming orders and packing workflow."],
    ["Quality Control", "Verify packed orders before dispatch."],
    ["Dispatch", "Coordinate ready orders with delivery."],
    ["Operations", "Monitor day-to-day backend activity."],
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="Backend Processing Team" subtitle="Operations control center for Fresh2Cook backend staff." />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">âœ“</div>
              <h2 className="font-extrabold text-[#123b38]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Header({ title, subtitle }: any) { return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38]">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>; }






