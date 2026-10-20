"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryHeatmapPage() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();

    const interval =
      setInterval(
        loadData,
        15000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  async function loadData() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-heatmap"
        );

      const result =
        await res.json();

      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading Heatmap...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Delivery Heatmap
        </h1>

        <p className="text-gray-500">
          Live Rider Coverage
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-2xl p-5">

          <p>
            Total Riders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              data?.summary
                ?.totalRiders
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5">

          <p>
            Online Riders
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              data?.summary
                ?.onlineRiders
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5">

          <p>
            Active Orders
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            {
              data?.summary
                ?.activeOrders
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5">

          <p>
            Delivered
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {
              data?.summary
                ?.deliveredOrders
            }
          </h2>

        </div>

      </div>

      <div className="bg-white rounded-2xl border p-6">

        <h2 className="text-xl font-bold mb-5">
          Live Rider Positions
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">
                  Rider
                </th>

                <th className="text-left p-3">
                  Status
                </th>

                <th className="text-left p-3">
                  Rating
                </th>

                <th className="text-left p-3">
                  Deliveries
                </th>

                <th className="text-left p-3">
                  Latitude
                </th>

                <th className="text-left p-3">
                  Longitude
                </th>

                <th className="text-left p-3">
                  Maps
                </th>

              </tr>

            </thead>

            <tbody>

              {data?.riders?.map(
                (
                  rider: any
                ) => (
                  <tr
                    key={
                      rider.id
                    }
                    className="border-b"
                  >

                    <td className="p-3">
                      {
                        rider.name
                      }
                    </td>

                    <td className="p-3">
                      {
                        rider.status
                      }
                    </td>

                    <td className="p-3">
                      ÃƒÂ¢Ã‚Â­Ã‚Â
                      {
                        rider.rating
                      }
                    </td>

                    <td className="p-3">
                      {
                        rider.completedDeliveries
                      }
                    </td>

                    <td className="p-3">
                      {
                        rider.latitude
                      }
                    </td>

                    <td className="p-3">
                      {
                        rider.longitude
                      }
                    </td>

                    <td className="p-3">

                      <a
                        target="_blank"
                        href={`https://maps.google.com/?q=${rider.latitude},${rider.longitude}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                      >
                        Open Map
                      </a>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="bg-white rounded-2xl border p-6">

        <h2 className="text-xl font-bold mb-5">
          Zone Health
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="border rounded-xl p-4">

            <h3 className="font-bold">
              Rajapuri
            </h3>

            <p>
              Riders:
              {" "}
              {
                data?.summary
                  ?.onlineRiders
              }
            </p>

            <p>
              Orders:
              {" "}
              {
                data?.summary
                  ?.activeOrders
              }
            </p>

          </div>

          <div className="border rounded-xl p-4">

            <h3 className="font-bold">
              Dwarka
            </h3>

            <p>
              Coverage:
              Good
            </p>

          </div>

          <div className="border rounded-xl p-4">

            <h3 className="font-bold">
              Dispatch Status
            </h3>

            <p>
              Active
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}






