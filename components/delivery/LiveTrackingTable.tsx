"use client";

export default function LiveTrackingTable({
  riders,
}: any) {
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
              Latitude
            </th>

            <th className="p-3">
              Longitude
            </th>

            <th className="p-3">
              Speed
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
                  {rider.latitude}
                </td>

                <td className="p-3">
                  {rider.longitude}
                </td>

                <td className="p-3">
                  {rider.speed}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}




