"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useState,
} from "react";

export default function DeliverySLAPage() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-sla"
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
      <div className="p-6">
        Loading SLA Report...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-4xl font-bold">
          Delivery SLA Dashboard
        </h1>

        <p className="text-gray-500">
          Delivery Performance Monitoring
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-2xl p-6">

          <p>
            Delivered Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              data?.summary
                ?.totalDelivered
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-6">

          <p>
            Avg Delivery Time
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {
              data?.summary
                ?.avgDeliveryTime
            }
            min
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-6">

          <p>
            Late Deliveries
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {
              data?.summary
                ?.lateDeliveries
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-6">

          <p>
            SLA Compliance
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              data?.summary
                ?.slaCompliance
            }
            %
          </h2>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white border rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-4">
            Fastest Rider
          </h2>

          <div>

            <p className="font-bold text-lg">
              {
                data?.summary
                  ?.fastestRider
                  ?.name
              }
            </p>

            <p>
              ÃƒÂ¢Ã‚Â­Ã‚Â
              {
                data?.summary
                  ?.fastestRider
                  ?.rating
              }
            </p>

            <p>
              Deliveries:
              {" "}
              {
                data?.summary
                  ?.fastestRider
                  ?.deliveries
              }
            </p>

          </div>

        </div>

        <div className="bg-white border rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-4">
            Slowest Rider
          </h2>

          <div>

            <p className="font-bold text-lg">
              {
                data?.summary
                  ?.slowestRider
                  ?.name
              }
            </p>

            <p>
              ÃƒÂ¢Ã‚Â­Ã‚Â
              {
                data?.summary
                  ?.slowestRider
                  ?.rating
              }
            </p>

            <p>
              Deliveries:
              {" "}
              {
                data?.summary
                  ?.slowestRider
                  ?.deliveries
              }
            </p>

          </div>

        </div>

      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Rider Performance
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-4 text-left">
                Rider
              </th>

              <th className="p-4 text-left">
                Rating
              </th>

              <th className="p-4 text-left">
                Deliveries
              </th>

              <th className="p-4 text-left">
                Earnings
              </th>

            </tr>

          </thead>

          <tbody>

            {data?.riders?.map(
              (rider: any) => (
                <tr
                  key={rider.id}
                  className="border-b"
                >

                  <td className="p-4">
                    {rider.name}
                  </td>

                  <td className="p-4">
                    ÃƒÂ¢Ã‚Â­Ã‚Â
                    {rider.rating}
                  </td>

                  <td className="p-4">
                    {
                      rider.deliveries
                    }
                  </td>

                  <td className="p-4 text-green-600">
                    Ã¢â€šÂ¹
                    {rider.earnings}
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






