"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
    salary: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  function loadEmployees() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-employees"
      ) || "[]"
    );

    setEmployees(data);
  }

  function addEmployee() {
    if (
      !form.name ||
      !form.phone
    ) {
      alert("Fill Required Fields");
      return;
    }

    const employee = {
      id: Date.now(),
      ...form,
      attendance: "Present",
      salaryPaid: false,
      joiningDate:
        new Date().toLocaleDateString(),
    };

    const updated = [
      employee,
      ...employees,
    ];

    localStorage.setItem(
      "freshcut-employees",
      JSON.stringify(updated)
    );

    setForm({
      name: "",
      phone: "",
      role: "",
      salary: "",
    });

    loadEmployees();
  }

  function toggleAttendance(
    id: number
  ) {
    const updated =
      employees.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              attendance:
                emp.attendance ===
                "Present"
                  ? "Absent"
                  : "Present",
            }
          : emp
      );

    localStorage.setItem(
      "freshcut-employees",
      JSON.stringify(updated)
    );

    setEmployees(updated);
  }

  function markSalaryPaid(
    id: number
  ) {
    const updated =
      employees.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              salaryPaid: true,
            }
          : emp
      );

    localStorage.setItem(
      "freshcut-employees",
      JSON.stringify(updated)
    );

    setEmployees(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Employee Management
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add Employee
          </h2>

          <div className="grid md:grid-cols-4 gap-5">

            <input
              placeholder="Employee Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name:
                    e.target.value,
                })
              }
              className="border p-3 rounded-2xl"
            />

            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone:
                    e.target.value,
                })
              }
              className="border p-3 rounded-2xl"
            />

            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role:
                    e.target.value,
                })
              }
              className="border p-3 rounded-2xl"
            />

            <input
              placeholder="Monthly Salary"
              value={form.salary}
              onChange={(e) =>
                setForm({
                  ...form,
                  salary:
                    e.target.value,
                })
              }
              className="border p-3 rounded-2xl"
            />

          </div>

          <button
            onClick={addEmployee}
            className="mt-6 bg-green-600 text-white px-8 py-3 rounded-2xl"
          >
            Add Employee
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {employees.map(
            (employee) => (

              <div
                key={employee.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold">
                  {employee.name}
                </h2>

                <p>
                  📞 {employee.phone}
                </p>

                <p>
                  👨‍💼 {employee.role}
                </p>

                <p>
                  💰 ₹{employee.salary}
                </p>

                <p
                  className={`mt-3 font-bold ${
                    employee.attendance ===
                    "Present"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {employee.attendance}
                </p>

                <p className="mt-2">
                  Salary:
                  {" "}
                  {employee.salaryPaid
                    ? "✅ Paid"
                    : "❌ Pending"}
                </p>

                <div className="grid grid-cols-2 gap-5 mt-6">

                  <button
                    onClick={() =>
                      toggleAttendance(
                        employee.id
                      )
                    }
                    className="bg-blue-600 text-white py-2 rounded-2xl"
                  >
                    Attendance
                  </button>

                  <button
                    onClick={() =>
                      markSalaryPaid(
                        employee.id
                      )
                    }
                    className="bg-green-600 text-white py-2 rounded-2xl"
                  >
                    Pay Salary
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}











