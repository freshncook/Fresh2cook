import Link from "next/link";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-\[1600px\] mx-auto px-6 py-12">

        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold text-gray-900">
            Fresh2Cook Partner Program
          </h1>

          <p className="text-lg text-gray-600 mt-4">
            Join Fresh2Cook as a Delivery Partner and earn with flexible working hours.
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white rounded-xl shadow-sm p-8 border">

            <div className="text-6xl mb-4">
              🚚
            </div>

            <h2 className="text-3xl font-bold mb-3">
              Delivery Partner Login
            </h2>

            <p className="text-gray-600 mb-6">
              Already registered? Login to manage deliveries,
              earnings, wallet, profile and live orders.
            </p>

            <Link
              href="/delivery/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              Login Now
            </Link>

          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border">

            <div className="text-6xl mb-4">
              📝
            </div>

            <h2 className="text-3xl font-bold mb-3">
              New Partner Registration
            </h2>

            <p className="text-gray-600 mb-6">
              Register as a new delivery partner and start earning
              with Fresh2Cook.
            </p>

            <Link
              href="/delivery/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              Register Now
            </Link>

          </div>

        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm p-8 border">

          <h2 className="text-3xl font-bold mb-6">
            Partner Benefits
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="p-5 rounded-2xl bg-green-50">
              <div className="text-4xl mb-3">
                💰
              </div>

              <h3 className="font-bold text-lg">
                Daily Earnings
              </h3>

              <p className="text-gray-600 mt-2">
                Earn on every successful delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50">
              <div className="text-4xl mb-3">
                🎯
              </div>

              <h3 className="font-bold text-lg">
                Incentives
              </h3>

              <p className="text-gray-600 mt-2">
                Extra rewards for top performers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50">
              <div className="text-4xl mb-3">
                ⏰
              </div>

              <h3 className="font-bold text-lg">
                Flexible Hours
              </h3>

              <p className="text-gray-600 mt-2">
                Work according to your schedule.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50">
              <div className="text-4xl mb-3">
                📈
              </div>

              <h3 className="font-bold text-lg">
                Growth Opportunity
              </h3>

              <p className="text-gray-600 mt-2">
                Increase earnings with better performance.
              </p>
            </div>

          </div>

        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm p-8 border">

          <h2 className="text-3xl font-bold mb-6">
            Registration Requirements
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Aadhaar Card
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Driving License
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Vehicle RC
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Mobile Number
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Passport Size Photo
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600 text-2xl">
                ✔
              </span>
              Active Delivery Vehicle
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}




