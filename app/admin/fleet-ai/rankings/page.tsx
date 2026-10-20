"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Page() {
  const [riders, setRiders] =
    useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(
      "/api/fleet-rider-score"
    );

    const json =
      await res.json();

    setRiders(
      json.riders || []
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Rider Rankings
      </h1>

      <div className="bg-white rounded-2xl shadow">

        <table className="w-full">

          <thead>
            <tr>
              <th className="p-3">
                Rank
              </th>

              <th className="p-3">
                Rider
              </th>

              <th className="p-3">
                Score
              </th>

              <th className="p-3">
                Deliveries
              </th>

              <th className="p-3">
                Earnings
              </th>
            </tr>
          </thead>

          <tbody>

            {riders.map(
              (
                rider,
                index
              ) => (
                <tr
                  key={rider.id}
                  className="border-b"
                >
                  <td className="p-3">
                    #{index + 1}
                  </td>

                  <td className="p-3">
                    {rider.name}
                  </td>

                  <td className="p-3">
                    {rider.score}
                  </td>

                  <td className="p-3">
                    {
                      rider.deliveries
                    }
                  </td>

                  <td className="p-3">
                    ₹
                    {
                      rider.earnings
                    }
                  </td>
                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}








