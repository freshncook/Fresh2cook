export default function Page() {
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        AI Recommendations Engine
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            Forecast Revenue
          </h3>
          <p className="text-2xl font-bold">
            ₹18,50,000
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            Demand Score
          </h3>
          <p className="text-2xl font-bold">
            92%
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            Churn Risk
          </h3>
          <p className="text-2xl font-bold">
            4.2%
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            AI Confidence
          </h3>
          <p className="text-2xl font-bold">
            96%
          </p>
        </div>

      </div>

    </div>
  );
}





