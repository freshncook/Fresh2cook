const fs = require("fs");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "components",
  "fresh2cook-landing.tsx"
);

const code = `"use client";

export default function Fresh2CookLanding() {
  const categories = [
    "Vegetables",
    "Fruits",
    "Leafy Greens",
    "Ready To Cook",
    "Dairy",
    "Combos",
  ];

  const products = [
    { name: "Fresh Tomato", price: "â‚¹29/kg" },
    { name: "Fresh Onion", price: "â‚¹35/kg" },
    { name: "Potato Premium", price: "â‚¹32/kg" },
    { name: "Fresh Apple", price: "â‚¹149/kg" },
  ];

  return (
    <div className="bg-[#f8f9fb] min-h-screen">

      <section className="bg-white">
        <div className="max-w-[1500px] mx-auto px-6 py-12">

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div>

              <div className="inline-flex bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                Fresh â€¢ Clean â€¢ Ready To Cook
              </div>

              <h1 className="text-6xl font-black mt-6 leading-tight">
                Fresh Food
                <span className="block text-green-600">
                  Delivered Same Day
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-600">
                Fresh vegetables, fruits and ready-to-cook products
                delivered directly to your doorstep.
              </p>

              <div className="flex gap-4 mt-8 flex-wrap">
                <button className="bg-green-600 text-white px-8 py-4 rounded-full font-bold">
                  Shop Now
                </button>

                <button className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-full font-bold">
                  Refer & Earn 10%
                </button>
              </div>

            </div>

            <div>

              <img
                src="/Grocery Bag.png"
                alt="Fresh2Cook"
                className="w-full max-w-[700px] mx-auto"
              />

            </div>

          </div>

        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 py-14">

        <h2 className="text-3xl font-bold mb-8">
          Shop By Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

          {categories.map((item) => (
            <div
              key={item}
              className="bg-white rounded-3xl p-6 text-center shadow hover:shadow-xl transition"
            >
              <div className="text-6xl">ðŸ¥¬</div>

              <div className="font-bold mt-4">
                {item}
              </div>
            </div>
          ))}

        </div>

      </section>

      <section className="max-w-[1500px] mx-auto px-6 py-14">

        <h2 className="text-3xl font-bold mb-8">
          Best Sellers
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {products.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-3xl shadow overflow-hidden"
            >

              <div className="h-56 bg-green-100 flex items-center justify-center text-7xl">
                ðŸ¥¦
              </div>

              <div className="p-5">

                <h3 className="font-bold text-lg">
                  {item.name}
                </h3>

                <div className="text-green-600 font-bold mt-2">
                  {item.price}
                </div>

                <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl">
                  Add To Cart
                </button>

              </div>

            </div>
          ))}

        </div>

      </section>

      <section className="max-w-[1500px] mx-auto px-6 py-12">

        <div className="bg-green-600 text-white rounded-[40px] p-10">

          <h2 className="text-4xl font-black">
            Refer & Earn 10%
          </h2>

          <p className="mt-4 text-lg">
            Share your referral link and earn rewards
            on every successful referral.
          </p>

        </div>

      </section>

      <section className="max-w-[1500px] mx-auto px-6 pb-14">

        <div className="bg-white rounded-[40px] p-10 shadow">

          <h2 className="text-3xl font-black">
            Check Delivery Availability
          </h2>

          <div className="flex mt-6 max-w-xl">

            <input
              placeholder="Enter Pincode"
              className="flex-1 border px-4 py-4 rounded-l-xl"
            />

            <button className="bg-green-600 text-white px-8 rounded-r-xl">
              Check
            </button>

          </div>

        </div>

      </section>

      <footer className="bg-[#0f172a] text-white">

        <div className="max-w-[1500px] mx-auto px-6 py-14">

          <h2 className="text-3xl font-black">
            Fresh2Cook
          </h2>

          <p className="mt-4 text-gray-300">
            Fresh Vegetables â€¢ Fruits â€¢ Ready To Cook
          </p>

        </div>

      </footer>

    </div>
  );
}
`;

fs.writeFileSync(filePath, code);

console.log("Homepage Replaced Successfully");
