"use client";

type Props = {
  orders: any[];
};

export default function OrderTable({
  orders,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Rider</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders?.map(
            (order) => (
              <tr
                key={
                  order.assignmentId
                }
                className="border-t"
              >
                <td>
                  #{order.orderId}
                </td>

                <td>
                  {
                    order.customer
                  }
                </td>

                <td>
                  â‚¹
                  {
                    order.amount
                  }
                </td>

                <td>
                  {
                    order.riderName
                  }
                </td>

                <td>
                  {
                    order.status
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


