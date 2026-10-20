"use client";

export default function FinanceSummary({
  data,
}: any) {
  if (!data) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const summary =
    data.summary || {};

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow p-5">
        <p>Revenue</p>

        <h2 className="text-3xl font-bold">
          ₹
          {
            summary.totalRevenue
          }
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Payout</p>

        <h2 className="text-3xl font-bold">
          ₹
          {
            summary.totalPayout
          }
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Profit</p>

        <h2 className="text-3xl font-bold">
          ₹
          {summary.profit}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p>Cost / Delivery</p>

        <h2 className="text-3xl font-bold">
          ₹
          {
            summary.costPerDelivery
          }
        </h2>
      </div>
    </div>
  );
}



