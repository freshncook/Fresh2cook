"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStoreSettings } from "@/lib/use-store-settings";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  stock?: number;
  image?: string;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
const [savedAddresses,setSavedAddresses]=useState<any[]>([]);

  useEffect(() => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("freshcut-cart") || "[]"
      );

      setItems(Array.isArray(cart) ? cart : []);

const phone =
localStorage.getItem("freshcut-phone") || "";

if(phone){
fetch(`/api/customer-addresses?phone=${phone}`)
.then(r=>r.json())
.then(data=>{
if(Array.isArray(data)){
setSavedAddresses(data);

const defaultAddress =
data.find((x:any)=>x.isDefault);

if(defaultAddress){
setAddress(
defaultAddress.address
);
}
}
});
}

setCustomer(
  localStorage.getItem("freshcut-customer") || ""
);

setPhone(
  localStorage.getItem("freshcut-phone") || ""
);

setAddress(
  localStorage.getItem("freshcut-address") || ""
);
    } catch {
      setItems([]);
    }
  }, []);

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item.qty || 1),
    0
  );

  const subTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.qty || 1),
    0
  );

  // Delivery rules come from Admin > Settings
  const storeSettings = useStoreSettings();

  const handlingCharge =
    subTotal > 0 ? storeSettings.handlingCharge : 0;

  const freeDeliveryTarget = storeSettings.freeDeliveryTarget;

  const deliveryCharge =
    subTotal >= freeDeliveryTarget
      ? 0
      : subTotal > 0
      ? storeSettings.deliveryCharge
      : 0;

  const grandTotal =
    subTotal +
    handlingCharge +
    deliveryCharge;

  function continueToPayment() {
    if (!customer.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      alert("Please enter a valid 10 digit mobile number.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    localStorage.setItem(
      "freshcut-customer",
      customer.trim()
    );

    localStorage.setItem(
      "freshcut-phone",
      phone.trim()
    );

    localStorage.setItem(
      "freshcut-address",
      address.trim()
    );

    localStorage.setItem(
      "freshcut-subtotal",
      String(subTotal)
    );

    localStorage.setItem(
      "freshcut-handling",
      String(handlingCharge)
    );

    localStorage.setItem(
      "freshcut-delivery",
      String(deliveryCharge)
    );

    localStorage.setItem(
      "freshcut-total",
      String(grandTotal)
    );

    localStorage.setItem(
      "freshcut-items",
      String(totalItems)
    );

    localStorage.setItem(
      "freshcut-order-items",
      JSON.stringify(items)
    );

    localStorage.setItem(
      "freshcut-payment-success-message",
      "Your order has been placed successfully."
    );

    window.location.href = "/payment";
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-5xl mb-4">
            🛒
          </div>

          <h1 className="text-3xl font-bold mb-3">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mb-6">
            Please add products before checkout.
          </p>

          <Link
            href="/products"
            className="inline-flex bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            Go To Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CUSTOMER DETAILS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">
              Delivery Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={customer}
                  onChange={(e) =>
                    setCustomer(e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  maxLength={10}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="10 digit mobile number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Delivery Address
                </label>

                {savedAddresses.length>0 && (
<select
className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
onChange={(e)=>{
setAddress(e.target.value);
}}
>

<option value="">
Select Saved Address
</option>

{savedAddresses.map((a:any)=>(
<option
key={a.id}
value={a.address}
>
{a.label} - {a.address}
</option>
))}
</select>
)}

<textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="House/Flat No., Society, Street, Dwarka"
                  rows={5}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-600 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div>
          <div className="bg-white rounded-xl shadow p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-5">
              Order Summary
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {Number(item.qty || 1)}
                    </p>
                  </div>

                  <p className="font-semibold whitespace-nowrap">
                    ₹
                    {Number(item.price || 0) *
                      Number(item.qty || 1)}
                  </p>
                </div>
              ))}
            </div>

            <hr className="my-5" />

            <div className="flex justify-between mb-3">
              <span>Products Total</span>
              <span>₹{subTotal}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Handling Charges</span>
              <span>₹{handlingCharge}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Delivery Charges</span>

              <span
                className={
                  deliveryCharge === 0
                    ? "text-green-600 font-bold"
                    : ""
                }
              >
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge}`}
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-2xl font-bold text-green-700">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            {subTotal < freeDeliveryTarget && (
              <p className="text-sm text-red-600 font-semibold mt-4">
                Add ₹
                {freeDeliveryTarget - subTotal}
                {" "}more for FREE Delivery
              </p>
            )}

            {subTotal >= freeDeliveryTarget && (
              <p className="text-sm text-green-600 font-semibold mt-4">
                🎉 FREE Delivery Unlocked
              </p>
            )}

            <button
              type="button"
              onClick={continueToPayment}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition"
            >
              Continue To Payment
            </button>

            <Link
              href="/cart"
              className="block text-center mt-4 text-green-700 font-semibold"
            >
              ← Back To Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}






