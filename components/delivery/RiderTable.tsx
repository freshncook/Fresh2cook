"use client";

type Props = {
  riders: any[];
};

export default function RiderTable({
  riders,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Deliveries</th>
          </tr>
        </thead>

        <tbody>
          {riders?.map(
            (rider) => (
              <tr
                key={rider.id}
                className="border-t"
              >
                <td>
                  {rider.name}
                </td>

                <td>
                  {rider.mobile}
                </td>

                <td>
                  {rider.status}
                </td>

                <td>
                  {
                    rider.rating
                  }
                </td>

                <td>
                  {
                    rider.completedDeliveries
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



