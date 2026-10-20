"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const cart = JSON.parse(
      localStorage.getItem("freshcut-cart") || "[]"
    );

    setItems(cart);
  }

  function updateCart(cart: any[]) {
    localStorage.setItem(
      "freshcut-cart",
      JSON.stringify(cart)
    );

    setItems([...cart]);
  }

  function increase(index: number) {
    const cart = [...items];

    cart[index].qty =
      Number(cart[index].qty || 1) + 1;

    updateCart(cart);
  }

  function decrease(index: number) {
    const cart = [...items];

    if (cart[index].qty > 1) {
      cart[index].qty =
        Number(cart[index].qty) - 1;

      updateCart(cart);
    }
  }

  function removeItem(index: number) {
    const cart = [...items];

    cart.splice(index, 1);

    updateCart(cart);
  }

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

  const handlingCharge =
    subTotal > 0 ? 10 : 0;

  const deliveryCharge =
    subTotal >= 500
      ? 0
      : subTotal > 0
      ? 40
      : 0;

  const grandTotal =
    subTotal +
    handlingCharge +
    deliveryCharge;

  const freeDeliveryTarget = 500;

  const remaining = Math.max(
    freeDeliveryTarget - subTotal,
    0
  );

  const progress = Math.min(
    (subTotal / freeDeliveryTarget) * 100,
    100
  );

  function proceed() {
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

    window.location.href =
      "/customer-details";
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pb-52">
      <h1 className="text-4xl font-bold mb-6">
        Shopping Cart
      </h1>

      {items.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center shadow">
          <h2 className="text-2xl font-bold">
            Cart Empty
          </h2>

          <a
            href="/products"
            className="inline-block mt-5 bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Shop Now
          </a>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-6 shadow mb-6">
            <div className="flex justify-between mb-2">
              <span>Products Total</span>
              <span>â‚¹{subTotal}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Handling Charges</span>
              <span>â‚¹{handlingCharge}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Delivery Charges</span>
              <span>â‚¹{deliveryCharge}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-2xl font-bold text-green-700">
              <span>Grand Total</span>
              <span>â‚¹{grandTotal}</span>
            </div>
          </div>

          {subTotal < freeDeliveryTarget ? (
            <div className="bg-white rounded-xl p-6 shadow mb-6">
              <p className="font-semibold mb-3 text-red-600">
                Add â‚¹{remaining} More For FREE Delivery
              </p>

              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 shadow mb-6">
              <p className="font-bold text-green-700 text-center text-lg">
                ðŸŽ‰ Congratulations! Free Delivery Unlocked
              </p>

              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-4">
                <div className="bg-green-600 h-4 rounded-full w-full" />
              </div>
            </div>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-5 mb-4"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold text-xl">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    â‚¹{item.price}
                  </p>
                </div>

                <button
                  onClick={() =>
                    removeItem(index)
                  }
                  className="text-red-600 font-bold"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() =>
                    decrease(index)
                  }
                  className="bg-red-500 text-white w-9 h-9 rounded-full"
                >
                  -
                </button>

                <span className="font-bold">
                  {item.qty}
                </span>

                <button
                  onClick={() =>
                    increase(index)
                  }
                  className="bg-green-600 text-white w-9 h-9 rounded-full"
                >
                  +
                </button>
              </div>

              <div className="mt-4 text-green-700 font-bold">
                â‚¹
                {Number(item.price) *
                  Number(item.qty)}
              </div>
            </div>
          ))}

          <div className="fixed bottom-20 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div>
                <div>
                  {totalItems} Items
                </div>

                <div className="text-3xl font-bold text-green-700">
                  â‚¹{grandTotal}
                </div>
              </div>

              <button
                onClick={proceed}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold"
              >
                Proceed Payment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}




