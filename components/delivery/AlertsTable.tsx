"use client";

export default function AlertsTable({
  alerts,
}: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3">
              Order ID
            </th>

            <th className="p-3">
              Alert
            </th>

            <th className="p-3">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {alerts.map(
            (
              item: any,
              index: number
            ) => (
              <tr
                key={index}
                className="border-b"
              >
                <td className="p-3">
                  {
                    item.orderId
                  }
                </td>

                <td className="p-3">
                  {
                    item.message
                  }
                </td>

                <td className="p-3">
                  {
                    item.status
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



