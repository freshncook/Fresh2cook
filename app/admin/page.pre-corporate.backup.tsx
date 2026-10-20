export const dynamic = "force-dynamic";
"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">

      {/* KPI ROW */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl border p-5">
          <div className="text-slate-500">Orders</div>
          <div className="text-5xl font-bold mt-2">28</div>
          <div className="text-green-600 mt-2">â†‘ 12%</div>
          <div className="text-sm text-slate-500">
            Today's Orders
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <div className="text-slate-500">Revenue</div>
          <div className="text-5xl font-bold mt-2">
            â‚¹4,580
          </div>
          <div className="text-green-600 mt-2">â†‘ 18%</div>
          <div className="text-sm text-slate-500">
            Today's Revenue
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <div className="text-slate-500">Customers</div>
          <div className="text-5xl font-bold mt-2">
            142
          </div>
          <div className="text-green-600 mt-2">â†‘ 8%</div>
          <div className="text-sm text-slate-500">
            Total Customers
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <div className="text-slate-500">Delivery</div>
          <div className="text-5xl font-bold mt-2">
            22
          </div>
          <div className="text-green-600 mt-2">â†‘ 15%</div>
          <div className="text-sm text-slate-500">
            Active Deliveries
          </div>
        </div>

      </div>

      {/* CHARTS */}

      <div className="grid xl:grid-cols-12 gap-5">

        <div className="xl:col-span-6 bg-white rounded-2xl border p-5">

          <div className="flex justify-between mb-4">

            <h2 className="text-2xl font-bold">
              Orders Overview
            </h2>

            <select className="border rounded-xl px-4 py-2">
              <option>Last 7 Days</option>
            </select>

          </div>

          <div className="h-[260px] flex items-end gap-5">

            {[18,22,25,20,28,32,26].map((v,i)=>(
              <div key={i} className="flex-1">

                <div
                  className="bg-green-500 rounded-t-xl"
                  style={{height:`${v*5}px`}}
                />

                <div className="text-center mt-2 text-sm">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                </div>

              </div>
            ))}

          </div>

        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl border p-5">

          <h2 className="text-2xl font-bold mb-6">
            Order Status
          </h2>

          <div className="flex justify-center">

            <div className="w-52 h-52 rounded-full border-[24px] border-green-500 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold">
                  28
                </div>
                <div>Total Orders</div>
              </div>
            </div>

          </div>

        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl border p-5">

          <h2 className="text-2xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid gap-3">

            <button className="bg-green-50 rounded-xl p-4 text-left">
              View Orders
            </button>

            <button className="bg-blue-50 rounded-xl p-4 text-left">
              Manage Products
            </button>

            <button className="bg-orange-50 rounded-xl p-4 text-left">
              WhatsApp Campaign
            </button>

            <button className="bg-purple-50 rounded-xl p-4 text-left">
              Add Customer
            </button>

            <button className="bg-green-50 rounded-xl p-4 text-left">
              Assign Delivery
            </button>

            <button className="bg-blue-50 rounded-xl p-4 text-left">
              View Reports
            </button>

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="grid xl:grid-cols-12 gap-5">

        <div className="xl:col-span-8 bg-white rounded-2xl border overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

          </div>

          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-t">
                <td className="p-4">10025</td>
                <td className="p-4">Anita Sharma</td>
                <td className="p-4">3</td>
                <td className="p-4">â‚¹350</td>
                <td className="p-4">Pending</td>
              </tr>

              <tr className="border-t">
                <td className="p-4">10024</td>
                <td className="p-4">Rahul Verma</td>
                <td className="p-4">5</td>
                <td className="p-4">â‚¹520</td>
                <td className="p-4">Processing</td>
              </tr>

              <tr className="border-t">
                <td className="p-4">10023</td>
                <td className="p-4">Priya Singh</td>
                <td className="p-4">2</td>
                <td className="p-4">â‚¹240</td>
                <td className="p-4">Ready</td>
              </tr>

            </tbody>

          </table>

        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl border p-5">

          <h2 className="text-2xl font-bold mb-5">
            Today's Activity
          </h2>

          <div className="space-y-4">

            <div>New order received #10025</div>
            <div>Order assigned to Rajesh</div>
            <div>Stock updated</div>
            <div>New customer registered</div>
            <div>Order delivered</div>

          </div>

        </div>

      </div>

    </div>
  );
}

