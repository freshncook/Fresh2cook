"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function CouponsPage() {
  const [coupons, setCoupons] =
    useState<any[]>([]);

  const [code, setCode] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  function loadCoupons() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-coupons"
      ) || "[]"
    );

    setCoupons(data);
  }

  function addCoupon() {
    if (!code || !discount) {
      alert(
        "Enter Coupon Code & Discount"
      );
      return;
    }

    const newCoupon = {
      id: Date.now(),
      code:
        code.toUpperCase(),
      discount:
        Number(discount),
    };

    const updated = [
      newCoupon,
      ...coupons,
    ];

    localStorage.setItem(
      "freshcut-coupons",
      JSON.stringify(updated)
    );

    setCoupons(updated);

    setCode("");
    setDiscount("");

    alert(
      "Coupon Added Successfully"
    );
  }

  function deleteCoupon(
    id: number
  ) {
    if (
      !confirm(
        "Delete Coupon?"
      )
    )
      return;

    const updated =
      coupons.filter(
        (coupon) =>
          coupon.id !== id
      );

    localStorage.setItem(
      "freshcut-coupons",
      JSON.stringify(updated)
    );

    setCoupons(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Coupon Management
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Add New Coupon
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                )
              }
              placeholder="Coupon Code"
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              value={discount}
              onChange={(e) =>
                setDiscount(
                  e.target.value
                )
              }
              placeholder="Discount %"
              className="border p-3 rounded-xl"
            />

            <button
              onClick={
                addCoupon
              }
              className="bg-green-600 text-white rounded-xl font-bold"
            >
              Add Coupon
            </button>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Available Coupons
          </h2>

          {coupons.length ===
          0 ? (
            <p className="text-gray-500">
              No Coupons Found
            </p>
          ) : (
            <div className="space-y-4">

              {coupons.map(
                (coupon) => (

                  <div
                    key={
                      coupon.id
                    }
                    className="border rounded-2xl p-4 flex justify-between items-center"
                  >

                    <div>

                      <h3 className="text-xl font-bold">
                        {
                          coupon.code
                        }
                      </h3>

                      <p className="text-green-600 font-bold">
                        {
                          coupon.discount
                        }
                        % Discount
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        deleteCoupon(
                          coupon.id
                        )
                      }
                      className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Delete
                    </button>

                  </div>

                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}








