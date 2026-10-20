"use client";

import Image from "next/image";

const offers = [
  {
    id: 1,
    title: "3 Day Kitchen Starter Pack",
    image: "/offers/offer-1.jpeg.jpeg",
  },
  {
    id: 2,
    title: "Weekly Subscription Plan",
    image: "/offers/offer-3.jpeg.jpeg",
  },
  {
    id: 3,
    title: "Refer & Earn ₹20",
    image: "/offers/offer-2.jpeg.jpeg",
  },
  {
    id: 4,
    title: "Fresh2Cook Special Offer",
    image: "/offers/offer-4.jpeg.jpeg",
  },
];

export default function OffersPage() {
  return (
    <div className="max-w-\[1600px\] mx-auto px-4 py-6">

      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Offers & Deals
        </h1>

        <p className="text-gray-500 mt-2">
          Save more with Fresh2Cook special offers
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden border"
          >
            <div className="flex justify-center p-4">
  <Image
    src={offer.image}
    alt={offer.title}
    width={250}
    height={250}
    className="w-[40%] h-auto rounded-x1"
  />
</div>

            <div className="p-4">
              <h2 className="font-bold text-xl">
                {offer.title}
              </h2>

              <a
                href="https://wa.me/919811001901"
                target="_blank"
                className="block mt-4 bg-green-600 text-white text-center py-3 rounded-xl font-bold"
              >
                Order On WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-green-50 border rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-3">
          Refer & Earn
        </h2>

        <p className="text-lg">
          Invite your friends and both get
          <span className="font-bold text-green-700">
            {" "}₹20 Wallet Credit
          </span>
        </p>

      </div>

    </div>
  );
}

