"use client";

export default function ReportsTable({
  rows,
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
          {rows.map(
            (row: any) => (
              <tr
                key={row.id}
                className="border-b"
              >
                <td className="p-3">
                  {row.name}
                </td>

                <td className="p-3">
                  {
                    row.completedDeliveries
                  }
                </td>

                <td className="p-3">
                  ₹
                  {
                    row.earnings
                  }
                </td>

                <td className="p-3">
                  {
                    row.rating
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



