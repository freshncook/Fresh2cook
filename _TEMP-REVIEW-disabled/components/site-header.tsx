"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <>
      <footer className="bg-[#062d18] text-white">

        {/* MAIN FOOTER */}

        <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">

            {/* BRAND */}

            <div>

              <div className="flex items-center gap-3">

                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-5xl">
                  ðŸ¥¬
                </div>

                <div>

                  <div className="text-3xl md:text-4xl font-extrabold">
                    <span className="text-green-400">
                      Fresh
                    </span>

                    <span className="text-orange-400">
                      2
                    </span>

                    <span className="text-white">
                      Cook
                    </span>
                  </div>

                  <div className="text-xs tracking-[0.22em] text-green-200 mt-1">
                    CUT  CLEAN  COOK
                  </div>

                </div>

              </div>

              <p className="text-gray-300 text-sm md:text-base leading-7 mt-6 max-w-md">
                Fresh2Cook brings you farm-fresh vegetables,
                ready-to-cook convenience and hygienic packing
                delivered to your doorstep.
              </p>

              {/* FOOTER QUALITY BADGES */}

              <div className="grid grid-cols-4 gap-2 mt-7">

                <div className="text-center border-r border-white/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-green-500 flex items-center justify-center text-2xl">
                    ðŸŒ¿
                  </div>

                  <div className="text-xs font-semibold mt-2">
                    Farm Fresh
                  </div>
                </div>

                <div className="text-center border-r border-white/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                    ðŸ›¡ï¸
                  </div>

                  <div className="text-xs font-semibold mt-2">
                    Hygienic
                  </div>
                </div>

                <div className="text-center border-r border-white/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-500 flex items-center justify-center text-2xl">
                    ðŸšš
                  </div>

                  <div className="text-xs font-semibold mt-2">
                    Fast Delivery
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500 flex items-center justify-center text-2xl">
                    â¤ï¸
                  </div>

                  <div className="text-xs font-semibold mt-2">
                    Trusted
                  </div>
                </div>

              </div>

            </div>

            {/* CATEGORY */}

            <div>

              <h3 className="text-xl font-bold mb-5">
                Shop by Category
              </h3>

              <div className="w-14 h-1 bg-lime-400 mb-5 rounded-full" />

              <div className="space-y-4 text-sm md:text-base text-gray-300">

                <Link
                  href="/products"
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <span>ðŸ¥¬</span>
                  <span>Fresh Vegetables</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <span>ðŸŽ</span>
                  <span>Fresh Fruits</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <span>ðŸ¥œ</span>
                  <span>Ready To Cook</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <span>ðŸ“¦</span>
                  <span>Combo Packs</span>
                </Link>

              </div>

            </div>

            {/* QUICK LINKS */}

            <div>

              <h3 className="text-xl font-bold mb-5">
                Quick Links
              </h3>

              <div className="w-14 h-1 bg-lime-400 mb-5 rounded-full" />

              <div className="space-y-4 text-sm md:text-base text-gray-300">

                <Link
                  href="/"
                  className="block hover:text-white transition"
                >
                  â†’ Home
                </Link>

                <Link
                  href="/products"
                  className="block hover:text-white transition"
                >
                  â†’ Shop
                </Link>

                <Link
                  href="/offers"
                  className="block hover:text-white transition"
                >
                  â†’ Offers
                </Link>

                <Link
                  href="/order-tracking"
                  className="block hover:text-white transition"
                >
                  â†’ Order Tracking
                </Link>

                <Link
                  href="/feedback"
                  className="block hover:text-white transition"
                >
                  â†’ Feedback & Reviews
                </Link>

                <Link
                  href="/products"
                  className="block hover:text-white transition"
                >
                  â†’ FAQ
                </Link>

              </div>

            </div>

            {/* CONTACT */}

            <div>

              <h3 className="text-xl font-bold mb-5">
                Contact Us
              </h3>

              <div className="w-14 h-1 bg-lime-400 mb-5 rounded-full" />

              <div className="space-y-4 text-sm md:text-base text-gray-300">

                <div className="flex gap-3">
                  <span className="text-xl">
                    ðŸ“
                  </span>

                  <span>
                    Dwarka, New Delhi
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-xl">
                    ðŸ“ž
                  </span>

                  <span>
                    +91 98110 01901
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-xl">
                    âœ‰ï¸
                  </span>

                  <span>
                    support@fresh2cook.in
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-xl">
                    ðŸ•’
                  </span>

                  <span>
                    Mon - Sun: 8 AM - 8 PM
                  </span>
                </div>

              </div>

              {/* SOCIAL */}

              <div className="flex flex-wrap gap-3 mt-7">

                <a
                  href="https://wa.me/919811001901"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-105 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 fill-white"
                    aria-hidden="true"
                  >
                    <path d="M20.52 3.48A11.87 11.87 0 0 0 12.07 0C5.52 0 .19 5.32.19 11.87c0 2.09.55 4.13 1.6 5.93L.1 24l6.34-1.66a11.88 11.88 0 0 0 5.63 1.43h.01c6.55 0 11.87-5.33 11.87-11.88 0-3.17-1.23-6.15-3.43-8.41ZM12.08 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.67-.23-.38a9.88 9.88 0 1 1 8.39 4.65Zm5.41-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.62.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold hover:scale-105 transition"
                >
                  â—Ž
                </a>

                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl hover:scale-105 transition"
                >
                  f
                </a>

                <a
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-white text-lg hover:scale-105 transition"
                >
                  â–¶
                </a>

              </div>

            </div>

          </div>

        </div>

        {/* STATS STRIP */}

        <div className="mt-12 bg-[#e8f8d4] text-[#10351b]">

          <div className="max-w-[1600px] mx-auto px-5 md:px-10">

            <div className="grid grid-cols-2 md:grid-cols-4">

              <div className="flex items-center justify-center gap-3 py-5 border-b md:border-b-0 md:border-r border-[#79a85f]">

                <div className="text-4xl">
                  ðŸ‘¥
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-extrabold">
                    5000+
                  </div>

                  <div className="text-xs md:text-sm font-semibold">
                    Happy Customers
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center gap-3 py-5 border-b md:border-b-0 md:border-r border-[#79a85f]">

                <div className="text-4xl">
                  ðŸ›’
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-extrabold">
                    100+
                  </div>

                  <div className="text-xs md:text-sm font-semibold">
                    Products
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center gap-3 py-5 border-r border-[#79a85f]">

                <div className="text-4xl">
                  ðŸšš
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-extrabold">
                    Same Day
                  </div>

                  <div className="text-xs md:text-sm font-semibold">
                    Delivery (Delhi NCR)
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center gap-3 py-5">

                <div className="text-4xl">
                  ðŸ›¡ï¸
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-extrabold">
                    100%
                  </div>

                  <div className="text-xs md:text-sm font-semibold">
                    Fresh & Hygienic
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM FOOTER */}

        <div className="max-w-[1600px] mx-auto px-5 md:px-10">

          <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-400">

            <div>
              Â© 2026 Fresh2Cook. All Rights Reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-5">

              <Link
                href="/"
                className="hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/"
                className="hover:text-white"
              >
                Terms & Conditions
              </Link>

              <Link
                href="/"
                className="hover:text-white"
              >
                Refund Policy
              </Link>

            </div>

          </div>

        </div>

      </footer>

      
    </>
  );
}



