"use client";
export const dynamic = "force-dynamic";

import {
  ShoppingCart,
  IndianRupee,
  Users,
  Truck,
  Package,
  Megaphone,
  FileText,
  UserPlus,
  Clock3,
} from "lucide-react";

export default function AdminDashboard() {
  const chart = [18, 22, 25, 20, 28, 32, 26];

  return (
    <div className="space-y-3 scale-[0.92] origin-top">

      {/* KPI */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

        <Card
          icon={<ShoppingCart className="w-8 h-8 text-green-600" />}
          bg="bg-green-50"
          title="Orders"
          value="28"
          growth="? 12%"
          subtitle="Today's Orders"
        />

        <Card
          icon={<IndianRupee className="w-8 h-8 text-blue-600" />}
          bg="bg-blue-50"
          title="Revenue"
          value="? 4,580"
growth="18%"
          subtitle="Today's Revenue"
        />

        <Card
          icon={<Users className="w-8 h-8 text-purple-600" />}
          bg="bg-purple-50"
          title="Customers"
          value="142"
          growth="? 8%"
          subtitle="Total Customers"
        />

        <Card
          icon={<Truck className="w-8 h-8 text-orange-600" />}
          bg="bg-orange-50"
          title="Delivery"
          value="22"
          growth="? 15%"
          subtitle="Active Deliveries"
        />

      </div>

      {/* MIDDLE */}

      <div className="grid xl:grid-cols-12 gap-3 items-start">

        {/* CHART */}

        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-5">

          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-2xl font-bold">
                Orders Overview
              </h2>
              <p className="text-slate-500 text-sm">
                Last 7 days order trend
              </p>
            </div>

            <select className="border rounded-xl px-4 py-2">
              <option>Last 7 Days</option>
            </select>
          </div>

          <div className="h-48 rounded-xl flex items-end gap-3 mt-4">

            {chart.map((v, i) => (
              <div key={i} className="flex-1">

                <div className="text-center mb-2 font-medium">
                  {v}
                </div>

                <div
                  className="bg-gradient-to-t from-green-600 to-green-400 rounded-xl"
                  style={{ height: `${v * 2.2}px` }}
                />

                <div className="text-center text-sm text-slate-500 mt-2">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* STATUS */}

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">

          

  <div className="space-y-4 w-32">

    <Row color="bg-green-500" name="Pending" count="6" />
    <Row color="bg-blue-500" name="Processing" count="4" />
    <Row color="bg-purple-500" name="Ready" count="8" />
    <Row color="bg-orange-500" name="Delivered" count="10" />

  </div>

</div>
       
                 


        {/* QUICK ACTIONS */}

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">

          <h2 className="text-2xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-2">

            <Action icon={<ShoppingCart size={18} />} text="View Orders" bg="bg-green-50" />
            <Action icon={<Truck size={18} />} text="Assign Delivery" bg="bg-green-50" />

            <Action icon={<Package size={18} />} text="Manage Products" bg="bg-blue-50" />
            <Action icon={<UserPlus size={18} />} text="Add Customer" bg="bg-purple-50" />

            <Action icon={<Megaphone size={18} />} text="WhatsApp Campaign" bg="bg-orange-50" />
            <Action icon={<Package size={18} />} text="Inventory" bg="bg-green-50" />
<Action icon={<Users size={18} />} text="Analytics" bg="bg-purple-50" />
<Action icon={<FileText size={18} />} text="Reports" bg="bg-blue-50" />
<Action icon={<Megaphone size={18} />} text="Marketing" bg="bg-orange-50" />

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="grid xl:grid-cols-12 gap-3 items-start">

        <div className="xl:col-span-8 bg-white rounded-2xl border overflow-hidden">

          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

            <button className="text-green-600 font-semibold">
              View All ?
            </button>
          </div>

          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              <OrderRow no="10025" customer="Anita Sharma" items="3" amount="?350" status="Pending" />
              <OrderRow no="10024" customer="Rahul Verma" items="5" amount="?520" status="Processing" />
              <OrderRow no="10023" customer="Priya Singh" items="2" amount="?240" status="Ready" />
              <OrderRow no="10022" customer="Karan Mehta" items="4" amount="?480" status="Delivered" />

            </tbody>

          </table>

        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl border p-5">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold">
              Today's Activity
            </h2>

            <button className="text-green-600 font-semibold">
              View All ?
            </button>

          </div>

          <div className="space-y-5">

            <Activity text="New order received #10025" />
            <Activity text="Order #10024 assigned to Rajesh" />
            <Activity text="Product stock updated" />
            <Activity text="New customer registered" />
            <Activity text="Order #10022 delivered" />

          </div>

        </div>

      </div>

    </div>
  );
}

function Card({
  icon,
  title,
  value,
  growth,
  subtitle,
  bg,
  graphColor = "green",
}: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">

        <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${bg}`}>
          {icon}
        </div>

        <div className="flex flex-col flex-1 ml-5">

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium text-lg">
              {title}
            </span>

            <span className="text-slate-400 text-2xl">
              â€º
            </span>
          </div>

          <div className="text-4xl font-bold text-slate-900 mt-2">
            {value}
          </div>

          <div className="text-green-600 font-semibold mt-1">
            ? {growth}
          </div>

          <div className="text-slate-500 mt-1">
            {subtitle}
          </div>

        </div>

        <div className="w-32 flex items-end justify-end">
          <svg width="120" height="50" viewBox="0 0 120 50" fill="none">
            <path
              d="M5 40 C25 10,40 10,55 28 C70 45,85 15,100 20 C108 22,114 20,118 18"
              stroke={
                graphColor === "blue"
                  ? "#1D73FF"
                  : graphColor === "purple"
                  ? "#A855F7"
                  : graphColor === "orange"
                  ? "#F97316"
                  : "#16A34A"
              }
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

      </div>
    </div>
  );
}

function Row({ color, name, count }: any) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        {name}
      </div>
      <div>{count}</div>
    </div>
  );
}

function Action({ icon, text, bg }: any) {
  return (
    <button
      className={`${bg} rounded-lg p-2 text-left flex items-center gap-2 font-medium hover:scale-105 hover:shadow-sm transition-all duration-200 active:scale-95`}
    >
      {icon}
      {text}
    </button>
  );
}

function OrderRow({ no, customer, items, amount, status }: any) {
  return (
    <tr className="border-t">
      <td className="p-3">{no}</td>
      <td className="p-3">{customer}</td>
      <td className="p-3">{items}</td>
      <td className="p-3">{amount}</td>
      <td className="p-3">

  <span
    className={`px-3 py-1 rounded-lg border text-sm font-semibold
    ${
      status === "Pending"
        ? "bg-orange-50 text-orange-600 border-orange-300"
        : status === "Processing"
        ? "bg-blue-50 text-blue-600 border-blue-300"
        : status === "Ready"
        ? "bg-purple-50 text-purple-600 border-purple-300"
        : "bg-green-50 text-green-600 border-green-300"
    }`}
  >
    <span
className={
status==="Delivered"
? "px-2 py-1 rounded-full bg-green-100 text-green-700"
: status==="Pending"
? "px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
: status==="Ready"
? "px-2 py-1 rounded-full bg-purple-100 text-purple-700"
: "px-2 py-1 rounded-full bg-blue-100 text-blue-700"
}
>
{status}
</span>
  </span>

</td>
    </tr>
  );
}

function Activity({ text }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <Clock3 size={18} />
      </div>
      <div>{text}</div>
    </div>
  );
}







