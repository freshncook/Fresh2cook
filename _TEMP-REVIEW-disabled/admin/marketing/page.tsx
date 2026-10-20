"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function MarketingPage() {
  const [customers, setCustomers] =
    useState<any[]>([]);

  useEffect(() => {
    const orders = JSON.parse(
      localStorage.getItem(
        "freshcut-orders"
      ) || "[]"
    );

    const unique: any = {};

    orders.forEach((o: any) => {
      unique[o.phone] = o;
    });

    setCustomers(
      Object.values(unique)
    );
  }, []);

  function sendCampaign(
    phone: string,
    type: string
  ) {
    let msg = "";

    if (type === "repeat") {
      msg =
`ÃƒÂ°Ã…Â¸Ã‚Â¥Ã‚Â¬ Fresh2Cook Reminder

Hi,

Time to reorder your fresh vegetables.

Get Fresh2Cook delivered today.

Use Coupon:

FRESH10

Get 10% OFF`;
    }

    if (type === "feedback") {
      msg =
`ÃƒÂ°Ã…Â¸Ã¢â€žÂ¢Ã‚Â Thank You For Ordering

Please share your feedback.

Your review helps us improve.

Fresh2Cook Team`;
    }

    if (type === "referral") {
      msg =
`ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â Refer & Earn

Refer Fresh2Cook to your friends.

Get Ã¢â€šÂ¹50 Cashback On Successful Referral.

Fresh2Cook Team`;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        msg
      )}`,
      "_blank"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          WhatsApp CRM
        </h1>

        <div className="space-y-4">

          {customers.map(
            (customer: any) => (

              <div
                key={customer.phone}
                className="bg-white rounded-2xl shadow p-6"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="font-bold text-xl">
                      {
                        customer.customer
                      }
                    </h2>

                    <p>
                      {
                        customer.phone
                      }
                    </p>

                  </div>

                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-6">

                  <button
                    onClick={() =>
                      sendCampaign(
                        customer.phone,
                        "repeat"
                      )
                    }
                    className="bg-green-600 text-white py-3 rounded-xl"
                  >
                    Repeat Order
                  </button>

                  <button
                    onClick={() =>
                      sendCampaign(
                        customer.phone,
                        "feedback"
                      )
                    }
                    className="bg-blue-600 text-white py-3 rounded-xl"
                  >
                    Feedback
                  </button>

                  <button
                    onClick={() =>
                      sendCampaign(
                        customer.phone,
                        "referral"
                      )
                    }
                    className="bg-purple-600 text-white py-3 rounded-xl"
                  >
                    Referral
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}








