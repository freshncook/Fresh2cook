"use client";

type Props = {
  data: any;
};

export default function DeliveryCharts({
  data,
}: Props) {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl shadow">
        <p>
          Total
        </p>

        <h2 className="text-3xl font-bold">
          {data?.total || 0}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <p>
          Delivered
        </p>

        <h2 className="text-3xl font-bold">
          {data?.delivered || 0}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <p>
          Late
        </p>

        <h2 className="text-3xl font-bold">
          {data?.late || 0}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <p>
          SLA
        </p>

        <h2 className="text-3xl font-bold">
          {data?.sla || 0}%
        </h2>
      </div>
    </div>
  );
}


