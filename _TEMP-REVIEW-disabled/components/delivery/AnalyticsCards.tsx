"use client";

export default function AnalyticsCards({
  data,
}: any) {
  if (!data) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow p-5">
        <p>Total Riders</p>

        <h2 className="text-3xl font-bold">
          {data.totalRiders}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Delivered</p>

        <h2 className="text-3xl font-bold">
          {data.deliveredOrders}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Pending</p>

        <h2 className="text-3xl font-bold">
          {data.pendingOrders}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Revenue</p>

        <h2 className="text-3xl font-bold">
          â‚¹
          {data.revenue}
        </h2>
      </div>
    </div>
  );
}


