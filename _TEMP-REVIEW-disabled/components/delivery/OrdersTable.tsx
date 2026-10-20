"use client";

export default function OrdersTable({
  orders,
}: {
  orders: any[];
}) {
  async function assignRider(
    orderId: number
  ) {
    const riderId =
      prompt(
        "Enter Rider ID"
      );

    if (!riderId) return;

    await fetch(
      "/api/delivery-assignments/create",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          orderId,
          riderId:
            Number(riderId),
        }),
      }
    );

    alert(
      "Rider Assigned"
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3">
              ID
            </th>

            <th className="p-3">
              Customer
            </th>

            <th className="p-3">
              Amount
            </th>

            <th className="p-3">
              Status
            </th>

            <th className="p-3">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map(
            (order: any) => (
              <tr
                key={order.id}
                className="border-b"
              >
                <td className="p-3">
                  #{order.id}
                </td>

                <td className="p-3">
                  {order.customer}
                </td>

                <td className="p-3">
                  â‚¹{order.amount}
                </td>

                <td className="p-3">
                  {order.status}
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      assignRider(
                        order.id
                      )
                    }
                    className="bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Assign Rider
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}



