"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    loadStaff();
  }, []);

  function loadStaff() {
    try {
      setStaff(
        JSON.parse(localStorage.getItem("freshcut-staff") || "[]")
      );
    } catch {
      setStaff([]);
    }
  }

  function addStaff() {
    if (!name || !phone || !role) {
      alert("Fill All Fields");
      return;
    }

    const member = {
      id: Date.now(),
      name,
      phone,
      role,
      status: "Active",
      joiningDate: new Date().toLocaleDateString(),
    };

    const updated = [member, ...staff];

    localStorage.setItem("freshcut-staff", JSON.stringify(updated));
    setStaff(updated);

    setName("");
    setPhone("");
    setRole("");

    alert("Staff Added Successfully");
  }

  function toggleStatus(id: number) {
    const updated = staff.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.status === "Active" ? "Inactive" : "Active",
          }
        : item
    );

    localStorage.setItem("freshcut-staff", JSON.stringify(updated));
    setStaff(updated);
  }

  function deleteStaff(id: number) {
    if (!confirm("Delete Staff?")) return;

    const updated = staff.filter((item) => item.id !== id);

    localStorage.setItem("freshcut-staff", JSON.stringify(updated));
    setStaff(updated);
  }

  const activeStaff = staff.filter((item) => item.status === "Active").length;

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage staff members, roles and active status.
          </p>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total Staff</p>
            <p className="mt-2 text-3xl font-extrabold text-[#123b38]">
              {staff.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">Active Staff</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-800">
              {activeStaff}
            </p>
          </div>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">
            Add Staff Member
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Staff Name"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <button
            onClick={addStaff}
            className="mt-5 rounded-xl bg-[#063f3d] px-8 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
          >
            + Add Staff
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#123b38]">
                    {member.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {member.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {member.role}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Joined {member.joiningDate}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    member.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => toggleStatus(member.id)}
                  className="flex-1 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100"
                >
                  Status
                </button>

                <button
                  onClick={() => deleteStaff(member.id)}
                  className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!staff.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No staff members added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






