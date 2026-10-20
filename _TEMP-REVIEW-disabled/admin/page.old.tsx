"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Business Dashboard
          </h1>

          <p className="text-slate-500">
            Fresh2Cook Performance Overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Card title="Revenue" value="₹2.48L" />

        <Card title="Orders" value="1,248" />

        <Card title="Customers" value="842" />

        <Card title="Products" value="118" />

      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-xl border p-6">

          <h2 className="font-semibold mb-4">
            Revenue Analytics
          </h2>

          <div className="h-[350px] rounded-2xl bg-slate-100 flex items-center justify-center">
            Revenue Chart Area
          </div>

        </div>

        <div className="bg-white rounded-xl border p-6">

          <h2 className="font-semibold mb-4">
            Recent Orders
          </h2>

          <div className="space-y-3">

            <OrderRow id="#1024" />

            <OrderRow id="#1023" />

            <OrderRow id="#1022" />

            <OrderRow id="#1021" />

            <OrderRow id="#1020" />

          </div>

        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        <div className="bg-white rounded-xl border p-6">

          <h2 className="font-semibold mb-4">
            Sales Performance
          </h2>

          <div className="h-64 bg-slate-100 rounded-2xl" />

        </div>

        <div className="bg-white rounded-xl border p-6">

          <h2 className="font-semibold mb-4">
            Customer Growth
          </h2>

          <div className="h-64 bg-slate-100 rounded-2xl" />

        </div>

        <div className="bg-white rounded-xl border p-6">

          <h2 className="font-semibold mb-4">
            Activity Feed
          </h2>

          <div className="space-y-2">
            <div>New Order Received</div>
            <div>Inventory Updated</div>
            <div>Payment Completed</div>
            <div>Customer Registered</div>
          </div>

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="text-slate-500 text-sm">
        {title}
      </div>

      <div className="text-4xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}

function OrderRow({
  id,
}: {
  id: string;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span>{id}</span>
      <span className="text-green-600">
        Delivered
      </span>
    </div>
  );
}
