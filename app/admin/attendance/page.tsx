"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => { loadStaff(); }, []);

  function loadStaff() {
    try {
      const data = JSON.parse(localStorage.getItem("freshcut-staff") || "[]");
      setStaff(data.map((item: any) => ({ ...item, attendance: item.attendance || "Absent" })));
    } catch { setStaff([]); }
  }

  function updateAttendance(id: number, status: string) {
    const updated = staff.map(item => item.id === id ? { ...item, attendance: status } : item);
    localStorage.setItem("freshcut-staff", JSON.stringify(updated));
    setStaff(updated);
  }

  const present = staff.filter(s => s.attendance === "Present").length;
  const absent = staff.filter(s => s.attendance === "Absent").length;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">
        <Header title="Staff Attendance" subtitle="Daily attendance control for the Fresh2Cook team." />
        <div className="mb-6 grid gap-5 sm:grid-cols-3">
          <Kpi title="Total Staff" value={staff.length} />
          <Kpi title="Present" value={present} green />
          <Kpi title="Absent" value={absent} red />
        </div>
        <div className="grid gap-5">
          {staff.map(employee => (
            <div key={employee.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-extrabold text-[#123b38]">{employee.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{employee.role || "Staff"} · {employee.mobile || "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateAttendance(employee.id, "Present")} className="rounded-2xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700">Present</button>
                  <button onClick={() => updateAttendance(employee.id, "Absent")} className="rounded-2xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700">Absent</button>
                </div>
              </div>
              <span className={`mt-4 inline-block rounded-full px-4 py-2 text-xs font-bold ${employee.attendance === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{employee.attendance}</span>
            </div>
          ))}
          {!staff.length && <Empty text="No staff records available." />}
        </div>
      </div>
    </div>
  );
}
function Header({ title, subtitle }: any) { return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38]">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>; }
function Kpi({ title, value, green, red }: any) { return <div className={`rounded-2xl border p-5 shadow-md ${green ? "border-emerald-100 bg-emerald-50" : red ? "border-red-100 bg-red-50" : "border-slate-200 bg-white"}`}><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-[#123b38]">{value}</p></div>; }
function Empty({ text }: any) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{text}</div>; }









