"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function FranchiseLeadsPage() {
  const [leads, setLeads] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [city, setCity] =
    useState("");

  const [phone, setPhone] =
    useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  function loadLeads() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-franchise-leads"
      ) || "[]"
    );

    setLeads(data);
  }

  function addLead() {
    if (
      !name ||
      !city ||
      !phone
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const updated = [
      {
        id: Date.now(),
        name,
        city,
        phone,
        status: "New Lead",
        createdAt:
          new Date().toLocaleDateString(),
      },
      ...leads,
    ];

    localStorage.setItem(
      "freshcut-franchise-leads",
      JSON.stringify(updated)
    );

    setName("");
    setCity("");
    setPhone("");

    loadLeads();
  }

  function updateStatus(
    id: number,
    status: string
  ) {
    const updated =
      leads.map(
        (lead: any) =>
          lead.id === id
            ? {
                ...lead,
                status,
              }
            : lead
      );

    localStorage.setItem(
      "freshcut-franchise-leads",
      JSON.stringify(updated)
    );

    loadLeads();
  }

  function deleteLead(
    id: number
  ) {
    const updated =
      leads.filter(
        (lead: any) =>
          lead.id !== id
      );

    localStorage.setItem(
      "freshcut-franchise-leads",
      JSON.stringify(updated)
    );

    loadLeads();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Franchise Leads
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add New Lead
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Lead Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              placeholder="City"
              className="border p-3 rounded-xl"
            />

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Phone Number"
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={addLead}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Save Lead
          </button>

        </div>

        <div className="space-y-4">

          {leads.map(
            (lead: any) => (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                  <div>

                    <h2 className="text-xl font-bold">
                      {lead.name}
                    </h2>

                    <p>
                      ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â {lead.city}
                    </p>

                    <p>
                      ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¾ {lead.phone}
                    </p>

                    <p className="mt-2 font-bold text-blue-600">
                      {lead.status}
                    </p>

                  </div>

                  <div className="flex gap-2 flex-wrap">

                    <button
                      onClick={() =>
                        updateStatus(
                          lead.id,
                          "Contacted"
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      Contacted
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          lead.id,
                          "Qualified"
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-xl"
                    >
                      Qualified
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          lead.id,
                          "Converted"
                        )
                      }
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                    >
                      Converted
                    </button>

                    <button
                      onClick={() =>
                        deleteLead(
                          lead.id
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}








