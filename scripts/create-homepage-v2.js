const fs = require("fs");
const path = require("path");

const homepage = `
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Fresh2Cook"
              className="h-12"
            />
          </div>

          <div className="flex-1 px-10">
            <input
              placeholder="Search products..."
              className="w-full border rounded-full px-5 py-3"
            />
          </div>

          <div className="flex gap-6 font-semibold">
            <Link href="/offers">Offers</Link>
            <Link href="/track-order">Track Order</Link>
            <Link href="/login">Login / Sign Up</Link>
          </div>

        </div>
      </header>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 px-6 py-16">

          <div>

            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
              Fresh Vegetables & Fruits
            </div>

            <h1 className="text-6xl font-extrabold mt-6">
              Delivered
              <span className="text-green-600">
                {" "}Same Day
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Fresh groceries delivered directly to your doorstep.
            </p>

            <div className="flex gap-4 mt-8">

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
              src="/hero-bag.png"
              alt="Hero"
              className="w-full"
            />
          </div>

        </div>
      </section>

    </main>
  );
}
`;

fs.mkdirSync("app", { recursive: true });

fs.writeFileSync(
  path.join(process.cwd(), "app", "page.tsx"),
  homepage
);

console.log("âœ… Homepage Updated Successfully");
