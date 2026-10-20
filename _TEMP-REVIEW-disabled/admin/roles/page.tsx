"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const permissions = [
  ["dashboard", "Dashboard"],
  ["orders", "Orders"],
  ["products", "Products"],
  ["customers", "Customers"],
  ["reports", "Reports"],
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  function loadRoles() {
    try {
      setRoles(JSON.parse(localStorage.getItem("freshcut-roles") || "[]"));
    } catch {
      setRoles([]);
    }
  }

  function addRole() {
    if (!roleName.trim()) {
      alert("Enter Role Name");
      return;
    }

    const role = {
      id: Date.now(),
      name: roleName.trim(),
      dashboard: true,
      orders: true,
      products: true,
      customers: true,
      reports: false,
    };

    const updated = [role, ...roles];
    localStorage.setItem("freshcut-roles", JSON.stringify(updated));
    setRoles(updated);
    setRoleName("");
  }

  function togglePermission(id: number, field: string) {
    const updated = roles.map((role) =>
      role.id === id
        ? { ...role, [field]: !role[field] }
        : role
    );

    localStorage.setItem("freshcut-roles", JSON.stringify(updated));
    setRoles(updated);
  }

  function deleteRole(id: number) {
    if (!confirm("Delete Role?")) return;

    const updated = roles.filter((role) => role.id !== id);
    localStorage.setItem("freshcut-roles", JSON.stringify(updated));
    setRoles(updated);
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Role Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create roles and control access to admin modules.
          </p>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">
            Create New Role
          </h2>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Role Name"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <button
              onClick={addRole}
              className="rounded-xl bg-[#063f3d] px-8 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
            >
              + Add Role
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#123b38]">
                    {role.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Configure module permissions
                  </p>
                </div>

                <button
                  onClick={() => deleteRole(role.id)}
                  className="rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                >
                  Delete Role
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {permissions.map(([field, label]) => (
                  <label
                    key={field}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      role[field]
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!role[field]}
                      onChange={() =>
                        togglePermission(role.id, field)
                      }
                      className="h-4 w-4 accent-emerald-600"
                    />

                    <span
                      className={`text-sm font-bold ${
                        role[field]
                          ? "text-emerald-800"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {!roles.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              No roles created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






