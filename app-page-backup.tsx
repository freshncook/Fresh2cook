import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function Home() {

  const bestSellerProducts = await prisma.product.findMany({
    where: {
      active: true,
      bestSeller: true,
    },
    orderBy: {
      id: "desc",
    },
    take: 6,
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
          take: 6,
        });

  const reviews = await prisma.customerFeedback.findMany({
    orderBy: {
      id: "desc",
    },
    take: 4,
  });

  const categories = [
    {
      name: "Fresh Vegetables",
      icon: "ðŸ¥¬",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900",
    },
    {
      name: "Fresh Fruits",
      icon: "ðŸŽ",
      image:
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900",
    },
    {
      name: "Ready To Cook",
      icon: "ðŸ”ª",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
    },
    {
      name: "Combo Packs",
      icon: "ðŸ“¦",
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",
    },
  ];

  const defaultReviews = [
    {
      id: "default-1",
      name: "Priya Sharma",
      comment:
        "Fresh vegetables and very convenient. It saves a lot of preparation time.",
      rating: 5,
    },
    {
      id: "default-2",
      name: "Neha Verma",
      comment:
        "The quality is really good and the vegetables are neatly packed.",
      rating: 5,
    },
    {
      id: "default-3",
      name: "Rahul Mehta",
      comment:
        "Very useful for busy families. Fresh, clean and easy to cook.",
      rating: 5,
    },
    {
      id: "default-4",
      name: "Anita Gupta",
      comment:
        "Loved the convenience and freshness. Definitely recommended.",
      rating: 5,
    },
  ];

  const reviewCards =
    reviews.length > 0
      ? reviews.map(
  (
    review: any,
    index: number
  ) => ({
          id: `review-${review.id}`,
          name: review.customer || `Happy Customer ${index + 1}`,
          comment:
            review.comment ||
            "Fresh products and excellent service.",
          rating: Number(review.rating || 5),
        }))
      : defaultReviews;

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HERO */}

      <section className="bg-[#f5f9f1]">

        <div className="max-w-[1500px] mx-auto px-4 md:px-8">

          <div className="grid lg:grid-cols-2 gap-8 items-center py-10 md:py-12">

            <div>

              <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold text-xs">
                ðŸŒ¿ Fresh â€¢ Hygienic â€¢ Ready To Cook
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.08] mt-5">

                Fresh Vegetables

                <span className="block text-green-700">
                  Ready To Cook
                </span>

                <span className="block text-orange-500">
                  Every Day
                </span>

              </h1>

              <p className="text-gray-600 text-base md:text-lg leading-7 mt-5 max-w-xl">
                Freshly cut, cleaned and hygienically
                packed vegetables delivered to your
                doorstep. Save time and enjoy convenient
                everyday cooking.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">

                <Link
                  href="/products"
                  className="bg-green-700 hover:bg-green-800 text-white px-7 py-3 rounded-full font-bold text-sm"
                >
                  Shop Now
                </Link>

                <Link
                  href="/products"
                  className="border border-green-700 text-green-700 px-7 py-3 rounded-full font-bold text-sm"
                >
                  View Products
                </Link>

              </div>

            </div>

            <div className="relative">

              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600"
                alt="Fresh vegetables"
                className="w-full h-[360px] md:h-[460px] object-cover rounded-[28px] shadow-xl"
              />

              <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-sm">

                <div className="font-extrabold text-green-700 text-sm">
                  Freshness Guaranteed
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Farm Fresh â€¢ Hygienic â€¢ Trusted
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CATEGORY */}

      <section className="py-12 px-4">

        <div className="max-w-[1500px] mx-auto">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl md:text-4xl font-extrabold">
                Shop By Category
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Fresh products for your everyday kitchen.
              </p>

            </div>

            <Link
              href="/products"
              className="hidden md:block text-green-700 font-bold text-sm"
            >
              View All â†’
            </Link>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {categories.map((category) => (

              <Link
                key={category.name}
                href="/products"
                className="group bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-sm transition"
              >

                <div className="relative">

                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                  />

                  <div className="absolute top-3 left-3 text-2xl">
                    {category.icon}
                  </div>

                </div>

                <div className="p-4">

                  <h3 className="font-bold text-base">
                    {category.name}
                  </h3>

                  <div className="text-green-700 font-semibold text-xs mt-1">
                    Explore â†’
                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* BEST SELLERS */}

      <section className="py-12 px-4 bg-[#f7f8f5]">

        <div className="max-w-[1500px] mx-auto">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl md:text-4xl font-extrabold">
                Best Sellers
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Customer favourites
              </p>

            </div>

            <Link
              href="/products"
              className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm"
            >
              View All
            </Link>

          </div>

          {products.length === 0 ? (

            <div className="bg-white rounded-2xl p-10 text-center text-gray-500">
              Products will appear here soon.
            </div>

          ) : (

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">

              {products.map(
  (product: any) => (

                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-sm transition"
                >

                  <div className="relative">

                    <img
                      src={
                        product.image ||
                        "/placeholder-product.png"
                      }
                      alt={product.name}
                      className="w-full h-32 md:h-36 object-cover"
                    />

                    {product.bestSeller && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-[9px] font-extrabold">
                        BEST
                      </div>
                    )}

                  </div>

                  <div className="p-3">

                    <h3 className="font-bold text-sm line-clamp-2 min-h-[36px]">
                      {product.name}
                    </h3>

                    <div className="text-green-700 text-lg font-extrabold mt-1">
                      â‚¹{product.price}
                    </div>

                    <Link
                      href="/products"
                      className="block text-center mt-2 bg-green-700 text-white py-2 rounded-lg text-xs font-bold"
                    >
                      Add To Cart
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* OFFER */}

      <section className="py-8 px-4">

        <div className="max-w-[1100px] mx-auto">

          <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">

            <div>

              <div className="text-xs uppercase tracking-[0.18em] font-bold text-green-700">
                Special Offer
              </div>

              <h2 className="text-2xl font-extrabold mt-1 text-green-900">
                10% Cashback
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                On Orders Above â‚¹500
              </p>

            </div>

            <Link
              href="/products"
              className="bg-green-700 text-white px-6 py-3 rounded-full font-bold text-sm"
            >
              Shop Now â†’
            </Link>

          </div>

        </div>

      </section>

      {/* WHY FRESH2COOK */}

      <section className="py-12 px-4">

        <div className="max-w-[1500px] mx-auto">

          <div className="text-center mb-8">

            <h2 className="text-3xl md:text-4xl font-extrabold">
              Why Fresh2Cook
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Simple, fresh and reliable.
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="border rounded-2xl p-6 text-center bg-green-50">
              <div className="text-3xl">ðŸ¥¬</div>

              <h3 className="font-bold mt-3">
                Farm Fresh
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Carefully selected fresh produce.
              </p>
            </div>

            <div className="border rounded-2xl p-6 text-center bg-blue-50">
              <div className="text-3xl">ðŸ§¼</div>

              <h3 className="font-bold mt-3">
                Hygienic
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Clean and hygienically packed.
              </p>
            </div>

            <div className="border rounded-2xl p-6 text-center bg-orange-50">
              <div className="text-3xl">â±ï¸</div>

              <h3 className="font-bold mt-3">
                Time Saving
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Cut, clean and cook with ease.
              </p>
            </div>

            <div className="border rounded-2xl p-6 text-center bg-yellow-50">
              <div className="text-3xl">â¤ï¸</div>

              <h3 className="font-bold mt-3">
                Trusted Quality
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Quality your family can trust.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CUSTOMER REVIEWS */}

      <section className="py-14 px-4 bg-[#f7f8f5]">

        <div className="max-w-[1500px] mx-auto">

          <div className="text-center mb-8">

            <p className="text-green-700 font-bold text-sm">
              CUSTOMER REVIEWS
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-1">
              What Our Customers Say
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Real experiences from our happy customers.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {reviewCards.map((review: {
  id: string;
  name: string;
  comment: string;
  rating: number;
}) => (

              <div
                key={review.id}
                className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
              >

                <div className="flex items-center justify-between">

                  <div className="text-yellow-400 text-lg tracking-wide">
                    {"â˜…".repeat(
                      Math.max(
                        1,
                        Math.min(
                          5,
                          Number(review.rating || 5)
                        )
                      )
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    {review.name.charAt(0).toUpperCase()}
                  </div>

                </div>

                <p className="text-gray-700 text-sm leading-6 mt-4 min-h-[96px]">
                  â€œ{review.comment}â€
                </p>

                <div className="border-t mt-4 pt-4">

                  <div className="font-bold text-sm">
                    {review.name}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Verified Customer
                  </div>

                </div>

              </div>

            ))}

          </div>

          <div className="text-center mt-8">

            <Link
              href="/feedback"
              className="inline-flex items-center justify-center border border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition"
            >
              â­ Give Your Review
            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="bg-[#082b16] text-white">

        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-12">

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

            <div>

              <div className="flex items-center">

  <img
    src="/fresh2cook-logo.png"
    alt="Fresh2Cook"
    className="h-20 w-auto"
  />

</div>

              <p className="text-gray-300 text-sm leading-6 mt-5">
                Fresh2Cook brings fresh vegetables,
                ready-to-cook convenience and hygienic
                packing to your doorstep.
              </p>

            </div>

            <div>

              <h3 className="text-lg font-bold mb-4">
                Shop By Category
              </h3>

              <div className="space-y-2 text-sm text-gray-300">

                <Link href="/products" className="block hover:text-white">
                  â†’ Fresh Vegetables
                </Link>

                <Link href="/products" className="block hover:text-white">
                  â†’ Fresh Fruits
                </Link>

                <Link href="/products" className="block hover:text-white">
                  â†’ Ready To Cook
                </Link>

                <Link href="/products" className="block hover:text-white">
                  â†’ Combo Packs
                </Link>

              </div>

            </div>

            <div>

              <h3 className="text-lg font-bold mb-4">
                Quick Links
              </h3>

              <div className="space-y-2 text-sm text-gray-300">

                <Link href="/" className="block hover:text-white">
                  â†’ Home
                </Link>

                <Link href="/products" className="block hover:text-white">
                  â†’ Shop
                </Link>

                <Link href="/offers" className="block hover:text-white">
                  â†’ Offers
                </Link>

                <Link
                  href="/order-tracking"
                  className="block hover:text-white"
                >
                  â†’ Order Tracking
                </Link>

                <Link
                  href="/feedback"
                  className="block hover:text-white"
                >
                  â†’ Feedback & Reviews
                </Link>

              </div>

            </div>

            <div>

              <h3 className="text-lg font-bold mb-4">
                Contact Us
              </h3>

              <div className="space-y-2 text-sm text-gray-300">

                <div>
                  ðŸ“ Dwarka, New Delhi
                </div>

                <div>
                  ðŸ“ž +91 98110 01901
                </div>

                <div>
                  âœ‰ï¸ support@fresh2cook.in
                </div>

                <div>
                  ðŸ•’ Mon - Sun: 8 AM - 8 PM
                </div>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                <a
                  href="https://wa.me/919811001901"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 px-3 py-2 rounded-full text-xs font-bold"
                >
                  WhatsApp
                </a>

                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-pink-600 px-3 py-2 rounded-full text-xs font-bold"
                >
                  Instagram
                </a>

                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 px-3 py-2 rounded-full text-xs font-bold"
                >
                  Facebook
                </a>

                <a
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-red-600 px-3 py-2 rounded-full text-xs font-bold"
                >
                  YouTube
                </a>

              </div>

            </div>

          </div>

          <div className="border-t border-white/10 mt-10 pt-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">

            <div>
              Â© 2026 Fresh2Cook. All Rights Reserved.
            </div>

            <div className="flex items-center gap-5">

              <Link href="/" className="hover:text-white">
                Privacy Policy
              </Link>

              <Link href="/" className="hover:text-white">
                Terms & Conditions
              </Link>

              <Link href="/" className="hover:text-white">
                Refund Policy
              </Link>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}


