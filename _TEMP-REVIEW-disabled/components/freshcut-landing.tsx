"use client";

import { useState } from "react";
import {
  Clock3,
  Truck,
  Leaf,
  ShieldCheck,
  Phone,
  Star,
} from "lucide-react";

export default function FreshCutLanding() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "",
    interest: "",
  });

  const [submitted, setSubmitted] = useState(false);

  async function submitLead() {
    await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        source: "Landing Page",
        status: "New",
        value: 0,
      }),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
        <div className="bg-white p-10 rounded-xl shadow-soft text-center max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            ðŸŽ‰ Thank You
          </h1>

          <p className="text-gray-600 mb-6">
            Fresh2Cook Team will contact you shortly.
          </p>

          <a
            href="https://wa.me/919811001901"
            target="_blank"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
          >
            WhatsApp Now
          </a>
        </div>
      </div>
    );
  }

  const products = [
    "à¤­à¤¿à¤‚à¤¡à¥€",
    "à¤—à¤µà¤¾à¤°",
    "à¤Ÿà¤¿à¤‚à¤¡à¤²à¥€",
    "à¤•à¤°à¥‡à¤²à¤¾",
    "à¤¬à¥€à¤¨à¥à¤¸",
    "à¤«à¥‚à¤²à¤—à¥‹à¤­à¥€",
    "à¤ªà¤¤à¥à¤¤à¤¾ à¤—à¥‹à¤­à¥€",
    "à¤¶à¤¿à¤®à¤²à¤¾ à¤®à¤¿à¤°à¥à¤š",
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}

      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-\[1600px\] mx-auto px-6 py-24 text-center">

          <div className="inline-block bg-white/10 px-4 py-2 rounded-full mb-6">
            ðŸ¥— Fresh Ready To Cook Vegetables
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Fresh2Cook
          </h1>

          <h2 className="text-2xl md:text-4xl font-semibold mb-6">
            à¤•à¤® à¤•à¤Ÿà¤¿à¤‚à¤—, à¤œà¥à¤¯à¤¾à¤¦à¤¾ à¤•à¥à¤•à¤¿à¤‚à¤—
          </h2>

          <p className="text-lg md:text-2xl text-green-100 mb-8">
            Fresh. Chopped. Ready To Cook.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <span className="bg-white/10 px-4 py-2 rounded-full">
              ðŸšš Free Delivery Above â‚¹350
            </span>

            <span className="bg-white/10 px-4 py-2 rounded-full">
              ðŸŒ± Farm Fresh Daily
            </span>

            <span className="bg-white/10 px-4 py-2 rounded-full">
              ðŸ¥— Ready To Cook
            </span>
          </div>

          <a
            href="https://wa.me/919811001901"
            target="_blank"
            className="bg-white text-brand-800 font-bold px-8 py-4 rounded-2xl text-lg"
          >
            Order On WhatsApp
          </a>
        </div>
      </section>

      {/* STATS */}

      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-6 text-center">

          <div className="bg-white shadow-soft rounded-2xl p-6">
            <h3 className="text-4xl font-bold text-brand-700">500+</h3>
            <p>Happy Families</p>
          </div>

          <div className="bg-white shadow-soft rounded-2xl p-6">
            <h3 className="text-4xl font-bold text-brand-700">1000+</h3>
            <p>Orders Delivered</p>
          </div>

          <div className="bg-white shadow-soft rounded-2xl p-6">
            <h3 className="text-4xl font-bold text-brand-700">98%</h3>
            <p>Satisfaction</p>
          </div>

          <div className="bg-white shadow-soft rounded-2xl p-6">
            <h3 className="text-4xl font-bold text-brand-700">Daily</h3>
            <p>Fresh Supply</p>
          </div>

        </div>
      </section>

      {/* WHY */}

      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-12">
            Why Families Love Fresh2Cook
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <Clock3 className="mx-auto mb-4" />
              <h3 className="font-bold">Save Time</h3>
              <p>30-45 Minutes Daily</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <Leaf className="mx-auto mb-4" />
              <h3 className="font-bold">Fresh Daily</h3>
              <p>Farm Fresh Vegetables</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <ShieldCheck className="mx-auto mb-4" />
              <h3 className="font-bold">Hygienic</h3>
              <p>Clean & Safe Packing</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <Truck className="mx-auto mb-4" />
              <h3 className="font-bold">Fast Delivery</h3>
              <p>Doorstep Delivery</p>
            </div>

          </div>
        </div>
      </section>

      {/* PRODUCTS */}

      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Popular Products
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {products.map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-soft p-6 text-center"
            >
              <div className="text-5xl mb-4">ðŸ¥¬</div>
              <h3 className="font-bold text-lg">
                {item}
              </h3>
              <p className="text-brand-700 font-semibold mt-2">
                Fresh2Cook
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* PROCESS */}

      <section className="bg-green-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div>1ï¸âƒ£ WhatsApp Order</div>
            <div>2ï¸âƒ£ Wash & Cut</div>
            <div>3ï¸âƒ£ Hygienic Pack</div>
            <div>4ï¸âƒ£ Doorstep Delivery</div>

          </div>

        </div>
      </section>

      {/* REVIEWS */}

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-12">
            Customer Reviews
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {[
              "à¤…à¤¬ à¤¸à¤¬à¥à¤œà¥€ à¤•à¤¾à¤Ÿà¤¨à¥‡ à¤•à¤¾ à¤à¤‚à¤à¤Ÿ à¤–à¤¤à¥à¤®",
              "Quality Superb",
              "Daily Time Saving",
            ].map((review) => (
              <div
                key={review}
                className="bg-white shadow-soft rounded-2xl p-6"
              >
                <div className="flex mb-3">
                  <Star fill="gold" />
                  <Star fill="gold" />
                  <Star fill="gold" />
                  <Star fill="gold" />
                  <Star fill="gold" />
                </div>

                <p>{review}</p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* OFFER */}

      <section className="bg-red-600 text-white text-center py-12 px-6">
        <h2 className="text-4xl font-bold mb-4">
          ðŸ”¥ Launch Offer
        </h2>

        <p className="text-xl">
          Free Delivery Above â‚¹350
        </p>

        <p className="text-xl">
          10% Wallet Credit Above â‚¹500
        </p>
      </section>

      {/* LEAD FORM */}

      <section className="max-w-3xl mx-auto py-20 px-6">

        <h2 className="text-4xl font-bold text-center mb-10">
          Request Callback
        </h2>

        <div className="space-y-4">

          <input
            className="border p-4 rounded-xl w-full"
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border p-4 rounded-xl w-full"
            placeholder="Mobile"
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            className="border p-4 rounded-xl w-full"
            placeholder="Area"
            onChange={(e) =>
              setForm({ ...form, area: e.target.value })
            }
          />

          <input
            className="border p-4 rounded-xl w-full"
            placeholder="Interested Product"
            onChange={(e) =>
              setForm({
                ...form,
                interest: e.target.value,
              })
            }
          />

          <button
            onClick={submitLead}
            className="w-full bg-brand-700 text-white py-4 rounded-xl font-bold"
          >
            Submit Lead
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="bg-black text-white text-center py-10">
        <h3 className="text-2xl font-bold mb-3">
          Fresh2Cook
        </h3>

        <p>
          Fresh. Chopped. Ready To Cook.
        </p>

        <p className="mt-4 text-gray-400">
          Â© 2026 Fresh2Cook
        </p>
      </footer>

      {/* FLOATING WHATSAPP */}

      <a
        href="https://wa.me/919811001901"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-sm"
      >
        <Phone />
      </a>

    </div>
  );
}<a
  href="/products"
  className="ml-4 bg-black text-white px-6 py-3 rounded-lg"
>
  View Products
</a>





