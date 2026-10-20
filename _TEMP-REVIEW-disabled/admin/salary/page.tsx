"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function SalaryPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [salaryData, setSalaryData] = useState<any[]>([]);

  useEffect(() => {
    try {
      setStaff(JSON.parse(localStorage.getItem("freshcut-staff") || "[]"));
      setSalaryData(JSON.parse(localStorage.getItem("freshcut-salary") || "[]"));
    } catch {
      setStaff([]);
      setSalaryData([]);
    }
  }, []);

  function updateSalary(employee: any, amount: string) {
    const updated = salaryData.filter((s) => s.staffId !== employee.id);

    updated.push({
      staffId: employee.id,
      name: employee.name,
      role: employee.role,
      salary: amount,
    });

    setSalaryData(updated);
    localStorage.setItem("freshcut-salary", JSON.stringify(updated));
  }

  function getSalary(id: number) {
    return salaryData.find((s) => s.staffId === id)?.salary || "";
  }

  const totalSalary = salaryData.reduce(
    (sum, item) => sum + Number(item.salary || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Salary Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage monthly staff salary records.
          </p>
        </div>

        <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">
            Monthly Salary Budget
          </p>
          <p className="mt-2 text-4xl font-extrabold text-[#123b38]">
            â‚¹{totalSalary.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {staff.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#123b38]">
                    {employee.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {employee.role}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {employee.mobile || employee.phone || "â€”"}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  SALARY
                </span>
              </div>

              <input
                type="number"
                placeholder="Monthly Salary"
                defaultValue={getSalary(employee.id)}
                onBlur={(e) => updateSalary(employee, e.target.value)}
                className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>
          ))}

          {!staff.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 md:col-span-2">
              No staff members available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






