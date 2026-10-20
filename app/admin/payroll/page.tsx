"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function PayrollPage() {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    loadStaff();
  }, []);

  function loadStaff() {
    try {
      setStaff(JSON.parse(localStorage.getItem("freshcut-staff") || "[]"));
    } catch {
      setStaff([]);
    }
  }

  function markPaid(id: number) {
    const updated = staff.map((item) =>
      item.id === id
        ? {
            ...item,
            salaryStatus: "Paid",
            paidDate: new Date().toLocaleDateString(),
          }
        : item
    );

    localStorage.setItem("freshcut-staff", JSON.stringify(updated));
    setStaff(updated);
  }

  const totalSalary = staff.reduce(
    (sum, item) => sum + Number(item.salary || 0),
    0
  );

  const paidSalary = staff
    .filter((item) => item.salaryStatus === "Paid")
    .reduce((sum, item) => sum + Number(item.salary || 0), 0);

  const pendingSalary = totalSalary - paidSalary;

  const cards = [
    ["Total Salary", totalSalary, "bg-blue-50", "text-blue-700"],
    ["Paid Salary", paidSalary, "bg-emerald-50", "text-emerald-700"],
    ["Pending Salary", pendingSalary, "bg-red-50", "text-red-700"],
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Payroll Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track salary payments and pending payroll.
          </p>
        </div>

        <div className="mb-7 grid gap-5 md:grid-cols-3">
          {cards.map(([title, value, bg, color]) => (
            <div
              key={String(title)}
              className={`rounded-2xl border border-slate-200 ${bg} p-5 shadow-md`}
            >
              <p className="text-sm font-bold text-slate-600">
                {title}
              </p>
              <p className={`mt-2 text-3xl font-extrabold ${color}`}>
                ₹{Number(value).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {staff.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#123b38]">
                    {employee.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {employee.role}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {employee.mobile || employee.phone || "—"}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-2xl font-extrabold text-emerald-700">
                    ₹{Number(employee.salary || 0).toLocaleString("en-IN")}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      employee.salaryStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {employee.salaryStatus || "Pending"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-5">
                <button
                  onClick={() => markPaid(employee.id)}
                  className="rounded-2xl bg-[#063f3d] px-6 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
                >
                  Mark Salary Paid
                </button>

                {employee.paidDate && (
                  <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Paid On: {employee.paidDate}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!staff.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              No staff payroll records available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










