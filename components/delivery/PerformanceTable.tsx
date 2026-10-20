"use client";

type Props = {
  data: any;
};

export default function PerformanceTable({
  data,
}: Props) {
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
        <p>Total Orders</p>

        <h2 className="text-3xl font-bold">
          {data.total}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Delivered</p>

        <h2 className="text-3xl font-bold">
          {data.delivered}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Late Deliveries</p>

        <h2 className="text-3xl font-bold">
          {data.late}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>SLA %</p>

        <h2 className="text-3xl font-bold">
          {data.sla}%
        </h2>
      </div>
    </div>
  );
}



