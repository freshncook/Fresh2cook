"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useState,
} from "react";

export default function DeliveryControlTowerPage() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();

    const interval =
      setInterval(
        loadData,
        10000
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
          "/api/admin-delivery-control-tower"
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
        Loading Control Tower...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-4xl font-bold">
          Delivery Control Tower
        </h1>

        <p className="text-gray-500">
          Fresh2Cook Command Center
        </p>

      </div>

      <div className="grid md:grid-cols-6 gap-4">

        <div className="bg-white border rounded-2xl p-5">
          <p>Total Riders</p>

          <h2 className="text-3xl font-bold">
            {
              data?.summary
                ?.totalRiders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>Online Riders</p>

          <h2 className="text-3xl font-bold text-green-600">
            {
              data?.summary
                ?.onlineRiders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>Active Orders</p>

          <h2 className="text-3xl font-bold text-blue-600">
            {
              data?.summary
                ?.activeOrders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>Completed</p>

          <h2 className="text-3xl font-bold text-purple-600">
            {
              data?.summary
                ?.completedOrders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>Delayed</p>

          <h2 className="text-3xl font-bold text-red-600">
            {
              data?.summary
                ?.delayedOrders
            }
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p>Earnings</p>

          <h2 className="text-3xl font-bold text-green-700">
            Ã¢â€šÂ¹
            {
              data?.summary
                ?.totalEarnings
            }
          </h2>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white border rounded-2xl">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold">
              Live Riders
            </h2>

          </div>

          <div className="p-5 space-y-3">

            {data?.riders?.map(
              (
                rider: any
              ) => (
                <div
                  key={
                    rider.id
                  }
                  className="border rounded-xl p-4"
                >

                  <div className="flex justify-between">

                    <div>

                      <h3 className="font-bold">
                        {
                          rider.name
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        {
                          rider.mobile
                        }
                      </p>

                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                      {
                        rider.status
                      }

                    </span>

                  </div>

                  <div className="mt-2 text-sm">

                    ÃƒÂ¢Ã‚Â­Ã‚Â
                    {
                      rider.rating
                    }
                    {" | "}
                    Deliveries:
                    {" "}
                    {
                      rider.completedDeliveries
                    }

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        <div className="bg-white border rounded-2xl">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold">
              Latest Orders
            </h2>

          </div>

          <div className="p-5 space-y-3">

            {data?.latestOrders?.map(
              (
                order: any
              ) => (
                <div
                  key={
                    order.id
                  }
                  className="border rounded-xl p-4"
                >

                  <div className="flex justify-between">

                    <div>

                      <h3 className="font-bold">
                        Order #
                        {
                          order.orderId
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        Rider:
                        {" "}
                        {
                          order.deliveryBoyId
                        }
                      </p>

                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                      {
                        order.status
                      }

                    </span>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}






