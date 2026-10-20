"use client";

export default function RidersTable({
  riders,
}: {
  riders: any[];
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3">
              Rider
            </th>

            <th className="p-3">
              Mobile
            </th>

            <th className="p-3">
              Status
            </th>

            <th className="p-3">
              Earnings
            </th>
          </tr>
        </thead>

        <tbody>
          {riders.map(
            (rider: any) => (
              <tr
                key={rider.id}
                className="border-b"
              >
                <td className="p-3">
                  {rider.name}
                </td>

                <td className="p-3">
                  {rider.mobile}
                </td>

                <td className="p-3">
                  {rider.status}
                </td>

                <td className="p-3">
                  ₹{rider.earnings}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}




