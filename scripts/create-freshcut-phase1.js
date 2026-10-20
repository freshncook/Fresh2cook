import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const bestSellerProducts =
    await prisma.product.findMany({
      where: {
        active: true,
        bestSeller: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 8,
    });

  const products =
    bestSellerProducts.length > 0
      ? bestSellerProducts
      : await prisma.product.findMany({
          where: {
            active: true,
          },
          orderBy: {
            id: "desc",
          },
          take: 8,
        });

  const categories = [
    {
      name: "Vegetables",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900",
    },
    {
      name: "Fruits",
      image:
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900",
    },
    {
      name: "Leafy Greens",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
    },
    {
      name: "Exotics",
      image:
        "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=900",
    },
    {
      name: "Dairy",
      image:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900",
    },
    {
      name: "Combos",
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f6f7]">
      {/* HEADER */}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">

          <div className="h-20 flex items-center justify-between gap-4">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                F
              </div>

              <div>
                <div className="text-2xl font-extrabold text-green-700">
                  Fresh2Cook
                </div>

                <div className="text-xs text-gray-500">
                  Cut â€¢ Clean â€¢ Cook
                </div>
              </div>
            </Link>

            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search vegetables, fruits, dairy..."
                className="w-full border rounded-full px-5 py-3 bg-gray-50"
              />
            </div>

            <div className="flex items-center gap-6 text-sm font-semibold">

              <Link href="/offers">
                Offers
              </Link>

              <Link href="/track-order">
                Track Order
              </Link>

              <Link href="/login">
                Login / Sign Up
              </Link>

            </div>

          </div>

        </div>
      </header>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-4 pt-8">

        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">

            <div className="p-10 lg:p-14">

              <div className="inline-flex bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                SAME DAY DELIVERY
              </div>

              <h1 className="mt-6 text-5xl lg:text-6xl font-extrabold leading-tight">

                FRESHER FOOD,

                <br />

                HAPPIER YOU

              </h1>

              <p className="mt-6 text-gray-600 text-lg max-w-xl">

                Farm fresh vegetables, fruits and daily essentials
                delivered to your doorstep with guaranteed freshness.

              </p>

              <div className="flex flex-wrap gap-4 mt-8">

                <Link
                  href="/products"
                  className="bg-green-600 text-white px-8 py-4 rounded-full font-bold"
                >
                  Shop Now
                </Link>

                <Link
                  href="/offers"
                  className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold"
                >
                  Refer & Earn 10%
                </Link>

              </div>

            </div>

            <div className="relative bg-[#eef8ee]">

              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"
                alt="Fresh2Cook"
                className="w-full h-full min-h-[520px] object-cover"
              />

              <div className="absolute top-6 right-6 flex flex-col gap-3">

                <div className="bg-white rounded-xl px-4 py-3 shadow font-semibold">
                  ðŸ¥¬ Fresh Produce
                </div>

                <div className="bg-white rounded-xl px-4 py-3 shadow font-semibold">
                  ðŸšš Same Day Delivery
                </div>

                <div className="bg-white rounded-xl px-4 py-3 shadow font-semibold">
                  â­ Premium Quality
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CATEGORIES */}

      <section className="max-w-7xl mx-auto px-4 py-10">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

          {categories.map((category) => (

            <div
              key={category.name}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >

              <img
                src={category.image}
                alt={category.name}
                className="w-full h-36 object-cover"
              />

              <div className="p-4 text-center font-bold">
                {category.name}
              </div>

            </div>

          ))}

        </div>

      </section>      {/* DELIVERY CHECK */}

      <section className="max-w-7xl mx-auto px-4 pb-10">

        <div className="bg-white rounded-[32px] p-8 shadow-sm">

          <div className="grid md:grid-cols-[1fr_320px] gap-6 items-center">

            <div>

              <h2 className="text-3xl font-extrabold">
                Check Delivery Availability
              </h2>

              <p className="text-gray-600 mt-2">
                Enter your pincode and check same-day delivery.
              </p>

            </div>

            <div className="flex gap-3">

              <input
                type="text"
                placeholder="Enter Pincode"
                className="flex-1 border rounded-xl px-4 py-3"
              />

              <button className="bg-green-600 text-white px-6 rounded-xl font-bold">
                Check
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURED PRODUCTS */}

      <section className="max-w-7xl mx-auto px-4 pb-12">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-4xl font-extrabold">
            Featured Products
          </h2>

          <Link
            href="/products"
            className="font-semibold text-green-600"
          >
            View All â†’
          </Link>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {products.map((product) => (

            <div
              key={product.id}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition"
            >

              <div className="h-60 bg-gray-100">

                <img
                  src={
                    product.image ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

              </div>

              <div className="p-5">

                <h3 className="font-bold text-lg">
                  {product.name}
                </h3>

                <div className="mt-2 text-green-600 font-extrabold text-2xl">
                  â‚¹{product.price}
                </div>

                <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-bold">
                  Add To Cart
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* REFER & EARN */}

      <section className="max-w-7xl mx-auto px-4 pb-12">

        <div className="rounded-[40px] overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white">

          <div className="grid lg:grid-cols-2 gap-10 p-10">

            <div>

              <div className="text-6xl">
                ðŸŽ
              </div>

              <h2 className="mt-4 text-5xl font-extrabold">
                Refer & Earn 10%
              </h2>

              <p className="mt-5 text-lg">

                Share your referral link with friends.
                When they place their first order,
                you receive 10% wallet cashback.

              </p>

              <button className="mt-8 bg-white text-orange-600 px-8 py-4 rounded-full font-bold">
                Start Referring
              </button>

            </div>

            <div className="bg-white/10 rounded-[32px] p-8">

              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-full bg-white text-orange-600 flex items-center justify-center font-extrabold">
                  1
                </div>

                <div className="font-semibold">
                  Share Referral Link
                </div>

              </div>

              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-full bg-white text-orange-600 flex items-center justify-center font-extrabold">
                  2
                </div>

                <div className="font-semibold">
                  Friend Places First Order
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-white text-orange-600 flex items-center justify-center font-extrabold">
                  3
                </div>

                <div className="font-semibold">
                  Earn 10% Cashback
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* WHY CHOOSE US */}

      <section className="max-w-7xl mx-auto px-4 pb-12">

        <div className="text-center mb-10">

          <h2 className="text-4xl font-extrabold">
            Why Choose Fresh2Cook
          </h2>

          <p className="text-gray-600 mt-3">
            Freshness, Quality & Convenience Delivered Daily
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-[28px] p-8 text-center">

            <div className="text-5xl mb-4">
              ðŸ¥¬
            </div>

            <h3 className="font-bold text-xl">
              Farm Fresh
            </h3>

            <p className="mt-3 text-gray-600">
              Directly sourced from trusted farms.
            </p>

          </div>

          <div className="bg-white rounded-[28px] p-8 text-center">

            <div className="text-5xl mb-4">
              ðŸšš
            </div>

            <h3 className="font-bold text-xl">
              Fast Delivery
            </h3>

            <p className="mt-3 text-gray-600">
              Same day delivery available.
            </p>

          </div>

          <div className="bg-white rounded-[28px] p-8 text-center">

            <div className="text-5xl mb-4">
              ðŸ”’
            </div>

            <h3 className="font-bold text-xl">
              Secure Payments
            </h3>

            <p className="mt-3 text-gray-600">
              Safe & trusted payment methods.
            </p>

          </div>

          <div className="bg-white rounded-[28px] p-8 text-center">

            <div className="text-5xl mb-4">
              ðŸŽ
            </div>

            <h3 className="font-bold text-xl">
              Rewards Program
            </h3>

            <p className="mt-3 text-gray-600">
              Earn rewards on every referral.
            </p>

          </div>

        </div>

      </section>      {/* CUSTOMER REVIEWS */}

      <section className="max-w-7xl mx-auto px-4 pb-12">

        <div className="text-center mb-10">

          <h2 className="text-4xl font-extrabold">
            Happy Customers
          </h2>

          <p className="text-gray-600 mt-3">
            What our customers say about us
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-[28px] p-6 shadow-sm">

            <div className="text-yellow-500 text-xl">
              â­â­â­â­â­
            </div>

            <p className="mt-4 text-gray-700">
              Excellent quality vegetables and fruits.
              Delivery was fast and products were fresh.
            </p>

            <div className="mt-5 font-bold">
              Rahul Sharma
            </div>

          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-sm">

            <div className="text-yellow-500 text-xl">
              â­â­â­â­â­
            </div>

            <p className="mt-4 text-gray-700">
              Best grocery experience. Packaging and
              freshness were outstanding.
            </p>

            <div className="mt-5 font-bold">
              Priya Gupta
            </div>

          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-sm">

            <div className="text-yellow-500 text-xl">
              â­â­â­â­â­
            </div>

            <p className="mt-4 text-gray-700">
              Same day delivery worked perfectly.
              Highly recommended.
            </p>

            <div className="mt-5 font-bold">
              Amit Verma
            </div>

          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-sm">

            <div className="text-yellow-500 text-xl">
              â­â­â­â­â­
            </div>

            <p className="mt-4 text-gray-700">
              Great prices and excellent customer support.
            </p>

            <div className="mt-5 font-bold">
              Neha Singh
            </div>

          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="max-w-7xl mx-auto px-4 pb-12">

        <div className="bg-green-600 rounded-[36px] text-white p-10">

          <div className="grid md:grid-cols-4 gap-8 text-center">

            <div>

              <div className="text-5xl font-extrabold">
                10K+
              </div>

              <div className="mt-2">
                Happy Customers
              </div>

            </div>

            <div>

              <div className="text-5xl font-extrabold">
                500+
              </div>

              <div className="mt-2">
                Products
              </div>

            </div>

            <div>

              <div className="text-5xl font-extrabold">
                50+
              </div>

              <div className="mt-2">
                Delivery Partners
              </div>

            </div>

            <div>

              <div className="text-5xl font-extrabold">
                99%
              </div>

              <div className="mt-2">
                Satisfaction Rate
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="bg-slate-900 text-white mt-10">

        <div className="max-w-7xl mx-auto px-4 py-16">

          <div className="grid md:grid-cols-4 gap-10">

            <div>

              <h3 className="text-3xl font-extrabold">
                Fresh2Cook
              </h3>

              <p className="mt-4 text-gray-400">
                Fresh vegetables, fruits and daily
                essentials delivered directly to your
                doorstep.
              </p>

            </div>

            <div>

              <h4 className="font-bold text-lg mb-4">
                Quick Links
              </h4>

              <div className="space-y-3 text-gray-400">

                <Link href="/">
                  Home
                </Link>

                <br />

                <Link href="/products">
                  Products
                </Link>

                <br />

                <Link href="/offers">
                  Offers
                </Link>

                <br />

                <Link href="/track-order">
                  Track Order
                </Link>

              </div>

            </div>

            <div>

              <h4 className="font-bold text-lg mb-4">
                Customer Support
              </h4>

              <div className="space-y-3 text-gray-400">

                <div>Help Center</div>

                <div>Track Order</div>

                <div>Returns</div>

                <div>Contact Support</div>

              </div>

            </div>

            <div>

              <h4 className="font-bold text-lg mb-4">
                Contact Us
              </h4>

              <div className="space-y-3 text-gray-400">

                <div>
                  ðŸ“ž +91 99999 99999
                </div>

                <div>
                  âœ‰ support@fresh2cook.in
                </div>

                <div>
                  ðŸ“ Delhi, India
                </div>

              </div>

            </div>

          </div>

          <div className="border-t border-slate-700 mt-10 pt-6 text-center text-gray-400">

            Â© 2026 Fresh2Cook. All Rights Reserved.

          </div>

        </div>

      </footer>

    </main>
  );
}
