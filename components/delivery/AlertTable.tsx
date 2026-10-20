"use client";

type Props = {
  alerts: any[];
};

export default function AlertTable({
  alerts,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <table className="w-full">
        <thead>
          <tr>
            <th>Order</th>
            <th>Alert</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {alerts?.map(
            (alert, index) => (
              <tr
                key={index}
                className="border-t"
              >
                <td>
                  {
                    alert.orderId
                  }
                </td>

                <td>
                  {
                    alert.message
                  }
                </td>

                <td>
                  {
                    alert.status
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



