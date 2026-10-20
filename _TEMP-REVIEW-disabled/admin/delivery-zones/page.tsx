"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

interface DeliveryZone {
  id: number;
  zoneName: string;
  sectors: string;
  charge: number;
  createdAt: string;
}

export default function DeliveryZonesPage() {
  const [zones, setZones] =
    useState<DeliveryZone[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [zoneName, setZoneName] =
    useState("");

  const [sectors, setSectors] =
    useState("");

  const [charge, setCharge] =
    useState("");

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/delivery-zones"
      );

      const data =
        await res.json();

      setZones(data);
    } catch (error) {
      alert(
        "Failed To Load Zones"
      );
    } finally {
      setLoading(false);
    }
  }

  async function addZone() {
    if (
      !zoneName ||
      !sectors ||
      !charge
    ) {
      alert("Fill All Fields");
      return;
    }

    await fetch(
      "/api/delivery-zones",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          zoneName,
          sectors,
          charge,
        }),
      }
    );

    setZoneName("");
    setSectors("");
    setCharge("");

    loadZones();
  }

  async function editZone(
    zone: DeliveryZone
  ) {
    const newName =
      prompt(
        "Zone Name",
        zone.zoneName
      );

    if (!newName) return;

    const newSectors =
      prompt(
        "Sectors",
        zone.sectors
      );

    if (!newSectors) return;

    const newCharge =
      prompt(
        "Charge",
        String(zone.charge)
      );

    if (!newCharge) return;

    await fetch(
      "/api/delivery-zones",
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: zone.id,
          zoneName:
            newName,
          sectors:
            newSectors,
          charge:
            Number(
              newCharge
            ),
        }),
      }
    );

    loadZones();
  }

  async function deleteZone(
    id: number
  ) {
    const ok = confirm(
      "Delete This Zone?"
    );

    if (!ok) return;

    await fetch(
      "/api/delivery-zones",
      {
        method:
          "DELETE",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      }
    );

    loadZones();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Delivery Zones
        </h1>

        <div className="bg-white p-6 rounded-xl shadow mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add Zone
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={zoneName}
              onChange={(e) =>
                setZoneName(
                  e.target.value
                )
              }
              placeholder="Zone Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={sectors}
              onChange={(e) =>
                setSectors(
                  e.target.value
                )
              }
              placeholder="Sectors"
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              value={charge}
              onChange={(e) =>
                setCharge(
                  e.target.value
                )
              }
              placeholder="Charge"
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={addZone}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl"
          >
            Add Zone
          </button>

        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl">
            Loading...
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">

            {zones.map(
              (zone) => (
                <div
                  key={zone.id}
                  className="bg-white p-6 rounded-xl shadow"
                >
                  <h2 className="text-2xl font-bold">
                    {
                      zone.zoneName
                    }
                  </h2>

                  <p className="mt-3">
                    {
                      zone.sectors
                    }
                  </p>

                  <p className="mt-3 text-green-600 font-bold text-xl">
                    Ã¢â€šÂ¹
                    {
                      zone.charge
                    }
                  </p>

                  <div className="flex gap-2 mt-5">

                    <button
                      onClick={() =>
                        editZone(
                          zone
                        )
                      }
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteZone(
                          zone.id
                        )
                      }
                      className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}






