"use client";

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

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const chart = [18, 22, 25, 20, 28, 32, 26];

  return (
    <div className="space-y-5">

      {/* KPI */}

      <div className="grid grid-cols-0 md:grid-cols-2 xl:grid-cols-4 gap-2">

        <Card
          icon={<ShoppingCart className="w-7 h-7 text-green-600" />}
          title="Orders"
          value="28"
          growth="+12%"
          subtitle="Today's Orders"
          bg="bg-green-50"
        />

        <Card
          icon={<IndianRupee className="w-7 h-7 text-blue-600" />}
          title="Revenue"
          value="Ã¢â€šÂ¹4,580"
          growth="+18%"
          subtitle="Today's Revenue"
          bg="bg-blue-50"
        />

        <Card
          icon={<Users className="w-7 h-7 text-purple-600" />}
          title="Customers"
          value="142"
          growth="+8%"
          subtitle="Total Customers"
          bg="bg-purple-50"
        />

        <Card
          icon={<Truck className="w-7 h-7 text-orange-600" />}
          title="Delivery"
          value="22"
          growth="+15%"
          subtitle="Active Deliveries"
          bg="bg-orange-50"
        />

      </div>

      {/* MIDDLE */}

      <div className="grid xl:grid-cols-12 gap-2">

        {/* ORDERS OVERVIEW */}

        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-600 p-4 shadow-sm h-[210px]">

          <div className="flex justify-between items-center mb-6">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Orders Overview
              </h2>

              <p className="text-slate-600 text-sm">
                Last 7 days order trend
              </p>
            </div>

            <select className="border rounded-lg px-4 py-0 text-sm">
              <option>Last 7 Days</option>
            </select>

          </div>

          <div className="h-20 flex items-end gap-3">

            {chart.map((v, i) => (
              <div key={i} className="flex-1">

                <div className="text-center text-sm mb-2 font-medium">
                  {v}
                </div>

                <div
                  className="rounded-xl bg-gradient-to-t from-green-600 to-green-400"
                  style={{
                    height: `${v * 2}px`,
                  }}
                />

                <div className="text-center text-xs text-slate-500 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* ORDER STATUS */}

        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-50 p-4 shadow-sm h-[210px]">

          <h2 className="text-lg font-bold mb-5">
            Order Status
          </h2>

          <div className="flex items-start justify-between gap-4 mt-2">

  <div className="relative w-28 h-28 rounded-full bg-[conic-gradient(#22c55e_0deg_120deg,#3b82f6_120deg_210deg,#a855f7_210deg_290deg,#f59e0b_290deg_360deg)] p-3">

    <div className="bg-white rounded-full w-full h-full flex items-center justify-center">

      <div className="text-center">
        <div className="text-2xl font-bold">28</div>
        <div className="text-xs text-slate-500">Orders</div>
      </div>

    </div>

  </div>

  <div className="flex-1 space-y-3">

    <Row color="bg-green-500" name="Pending" count="6" />
    <Row color="bg-blue-500" name="Processing" count="4" />
    <Row color="bg-purple-500" name="Ready" count="8" />
    <Row color="bg-orange-500" name="Delivered" count="10" />

  </div>

</div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-[210px] overflow-hidden">

  <h2 className="text-lg font-bold mb-2">
    Quick Actions
  </h2>

  <div className="grid grid-cols-2 gap-2">

    <Action icon={<ShoppingCart size={18} />} text="Orders" />
    <Action icon={<Truck size={18} />} text="Delivery" />
    <Action icon={<Package size={18} />} text="Products" />
    <Action icon={<UserPlus size={18} />} text="Customer" />
    <Action icon={<Megaphone size={18} />} text="Campaign" />
    <Action icon={<Package size={18} />} text="Inventory" />
    <Action icon={<Users size={18} />} text="Analytics" />
    <Action icon={<FileText size={18} />} text="Reports" />

  </div>

</div>

      </div>

      {/* BOTTOM */}

      <div className="grid xl:grid-cols-12 gap-2">

        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5 border-b flex justify-between items-center">

            <h2 className="text-lg font-bold">
              Recent Orders
            </h2>

            <button className="text-green-600 font-semibold">
              View All
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

              <OrderRow
                no="10025"
                customer="Anita Sharma"
                items="3"
                amount="Ã¢â€šÂ¹350"
                status="Pending"
              />

              <OrderRow
                no="10024"
                customer="Rahul Verma"
                items="5"
                amount="Ã¢â€šÂ¹520"
                status="Processing"
              />

              <OrderRow
                no="10023"
                customer="Priya Singh"
                items="2"
                amount="Ã¢â€šÂ¹240"
                status="Ready"
              />

              <OrderRow
                no="10022"
                customer="Karan Mehta"
                items="4"
                amount="Ã¢â€šÂ¹480"
                status="Delivered"
              />

            </tbody>

          </table>

        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-[2200px] overflow-hidden">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-lg font-bold">
              Today's Activity
            </h2>

            <button className="text-green-600 font-semibold">
              View All
            </button>

          </div>

          <div className="space-y-6">

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
}: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm h-[85px]">

      <div className="flex items-center justify-between h-full">

        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
          {icon}
        </div>

        <div className="flex-1 px-3">

          <div className="text-slate-500 text-sm font-medium">
            {title}
          </div>

          <div className="text-xl font-bold">
            {value}
          </div>

          <div className="text-green-600 text-sm font-semibold">
            {growth}
          </div>

          <div className="text-xs text-slate-500">
            {subtitle}
          </div>

        </div>

        <div className="w-12 flex justify-end">
          <svg width="60" height="28" viewBox="0 0 90 40" fill="none">
            <path
              d="M0 30 C15 5, 30 5, 45 25 S75 35, 90 10"
              stroke="#22c55e"
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
    <div className="flex justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        {name}
      </div>
      <div className="font-semibold">{count}</div>
    </div>
  );
}

function Action({ icon, text }: any) {
  return (
    <button className="bg-slate-50 hover:bg-green-50 rounded-xl p-3 text-sm font-medium flex items-center gap-2 transition">
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
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
          {status}
        </span>
      </td>

    </tr>
  );
}

function Activity({ text }: any) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <Clock3 size={16} />
      </div>

      <div className="text-sm">
        {text}
      </div>

    </div>
  );
}

