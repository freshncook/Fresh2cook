export default function SiteFooter() {
  return (
    <footer className="bg-[#0b3d1d] text-white mt-20">

      <div className="grid grid-cols-2 md:grid-cols-4 text-center border-b border-white/10">

        <div className="py-6">
          <div className="text-3xl font-bold">
            5000+
          </div>

          <div className="text-sm text-green-100">
            Happy Customers
          </div>
        </div>

        <div className="py-6">
          <div className="text-3xl font-bold">
            100+
          </div>

          <div className="text-sm text-green-100">
            Products
          </div>
        </div>

        <div className="py-6">
          <div className="text-3xl font-bold">
            Same Day
          </div>

          <div className="text-sm text-green-100">
            Delivery
          </div>
        </div>

        <div className="py-6">
          <div className="text-3xl font-bold">
            100%
          </div>

          <div className="text-sm text-green-100">
            Fresh
          </div>
        </div>

      </div>

      <div className="max-w-\[1600px\] mx-auto px-6 py-12">

        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div>

            <img
              src="/fresh2cook-logo.png"
              alt="Fresh2Cook"
              className="h-20 mb-4"
            />

            <h3 className="text-3xl font-bold">
              Fresh2Cook
            </h3>

            <p className="mt-4 text-green-100 max-w-lg">
              Fresh vegetables, fruits and ready-to-cook products
              delivered directly to your doorstep.
            </p>

            <div className="flex gap-4 mt-8">

              <a
                href="https://wa.me/919999999999"
                target="_blank"
              >
                <img
                  src="/social/whatsapp.png"
                  alt="WhatsApp"
                  className="w-12 h-12"
                />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
              >
                <img
                  src="/social/instagram.png"
                  alt="Instagram"
                  className="w-12 h-12"
                />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
              >
                <img
                  src="/social/facebook.png"
                  alt="Facebook"
                  className="w-12 h-12"
                />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
              >
                <img
                  src="/social/youtube.png"
                  alt="YouTube"
                  className="w-12 h-12"
                />
              </a>

              <a
                href="https://x.com"
                target="_blank"
              >
                <img
                  src="/social/x.png"
                  alt="X"
                  className="w-12 h-12"
                />
              </a>

            </div>

          </div>

          <div className="flex justify-center">

            <img
              src="/basket.png"
              alt="Fresh Basket"
              className="max-w-md w-full"
            />

          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-green-100">
          Â© 2026 Fresh2Cook. All Rights Reserved.
        </div>

      </div>

    </footer>
  );
}



