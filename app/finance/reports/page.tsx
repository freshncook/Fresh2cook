export default function Page() {
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Financial Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">₹12,50,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Expenses</h3>
          <p className="text-2xl font-bold">₹7,80,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Profit</h3>
          <p className="text-2xl font-bold">₹4,70,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Margin</h3>
          <p className="text-2xl font-bold">37.6%</p>
        </div>

      </div>

    </div>
  );
}





