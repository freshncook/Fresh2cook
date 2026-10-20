"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function CustomerFeedbackPage() {
  const [feedbacks,
    setFeedbacks] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  async function loadFeedbacks() {
    try {
      const res =
        await fetch(
          "/api/admin-delivery-performance"
        );

      const data =
        await res.json();

      setFeedbacks(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getBadge(
    rating: number
  ) {
    if (rating >= 4.8)
      return "🥇 Gold";

    if (rating >= 4.5)
      return "🥈 Silver";

    if (rating >= 4)
      return "🥉 Bronze";

    return "⭐ Standard";
  }

  if (loading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Customer Feedback
        </h1>

        <p className="text-gray-500">
          Rider Rating &
          Performance
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-5">

        <div className="bg-white rounded-2xl border p-5">

          <p>
            Total Riders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              feedbacks.length
            }
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p>
            Gold Riders
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {
              feedbacks.filter(
                (
                  rider
                ) =>
                  rider.rating >=
                  4.8
              ).length
            }
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p>
            Silver Riders
          </p>

          <h2 className="text-3xl font-bold text-gray-600 mt-2">
            {
              feedbacks.filter(
                (
                  rider
                ) =>
                  rider.rating >=
                    4.5 &&
                  rider.rating <
                    4.8
              ).length
            }
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p>
            Bronze Riders
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            {
              feedbacks.filter(
                (
                  rider
                ) =>
                  rider.rating >=
                    4 &&
                  rider.rating <
                    4.5
              ).length
            }
          </h2>

        </div>

      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Rider Leaderboard
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-4">
                Rider
              </th>

              <th className="text-left p-4">
                Rating
              </th>

              <th className="text-left p-4">
                Deliveries
              </th>

              <th className="text-left p-4">
                Earnings
              </th>

              <th className="text-left p-4">
                Badge
              </th>

            </tr>

          </thead>

          <tbody>

            {feedbacks.map(
              (
                rider
              ) => (
                <tr
                  key={
                    rider.id
                  }
                  className="border-t"
                >

                  <td className="p-4">
                    {
                      rider.name
                    }
                  </td>

                  <td className="p-4">
                    ⭐
                    {
                      rider.rating
                    }
                  </td>

                  <td className="p-4">
                    {
                      rider.completed
                    }
                  </td>

                  <td className="p-4 text-green-600 font-semibold">
                    ₹
                    {
                      rider.earnings
                    }
                  </td>

                  <td className="p-4">
                    {getBadge(
                      rider.rating
                    )}
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










