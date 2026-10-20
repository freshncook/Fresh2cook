"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useState,
} from "react";

export default function DeliveryFinancePage() {
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
          "/api/admin-delivery-finance"
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
        Loading Finance Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-4xl font-bold">
          Delivery Finance Center
        </h1>

        <p className="text-gray-500">
          Revenue, Cost &
          Profit Analytics
        </p>

      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Delivered Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              data?.summary
                ?.deliveredOrders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Revenue
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.totalRevenue
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Rider Payout
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.totalPayout
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Incentives
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.totalIncentive
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Profit
          </p>

          <h2 className="text-3xl font-bold text-purple-600 mt-2">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.profit
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>
            Cost / Delivery
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.costPerDelivery
            }
          </h2>
        </div>

      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Rider Salary Report
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-4 text-left">
                Rider
              </th>

              <th className="p-4 text-left">
                Deliveries
              </th>

              <th className="p-4 text-left">
                Earnings
              </th>

              <th className="p-4 text-left">
                Incentive
              </th>

              <th className="p-4 text-left">
                Total Payout
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

                  <td className="p-4 font-medium">
                    {
                      rider.name
                    }
                  </td>

                  <td className="p-4">
                    {
                      rider.deliveries
                    }
                  </td>

                  <td className="p-4 text-blue-600">
                    Ã¢â€šÂ¹
                    {
                      rider.earnings
                    }
                  </td>

                  <td className="p-4 text-orange-600">
                    Ã¢â€šÂ¹
                    {
                      rider.incentive
                    }
                  </td>

                  <td className="p-4 text-green-600 font-bold">
                    Ã¢â€šÂ¹
                    {
                      rider.totalPayout
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






