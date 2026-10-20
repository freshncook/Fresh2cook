"use client";

export default function LeaderboardTable({
  riders,
}: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3">
              Rank
            </th>

            <th className="p-3">
              Rider
            </th>

            <th className="p-3">
              Deliveries
            </th>

            <th className="p-3">
              Earnings
            </th>

            <th className="p-3">
              Rating
            </th>
          </tr>
        </thead>

        <tbody>
          {riders.map(
            (
              rider: any,
              index: number
            ) => (
              <tr
                key={rider.id}
                className="border-b"
              >
                <td className="p-3">
                  {index + 1}
                </td>

                <td className="p-3">
                  {rider.name}
                </td>

                <td className="p-3">
                  {
                    rider.completedDeliveries
                  }
                </td>

                <td className="p-3">
                  â‚¹
                  {
                    rider.earnings
                  }
                </td>

                <td className="p-3">
                  {
                    rider.rating
                  }
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


