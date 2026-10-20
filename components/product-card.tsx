"use client";

import { useEffect, useState } from "react";

type Props = {
  id: number;
  name: string;
  price: number;
  pack: string;
  image?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  pack,
  image,
}: Props) {
  const [qty, setQty] = useState(0);

  const [selectedPack, setSelectedPack] =
    useState("250g");

  const mrp =
    Math.round(price * 1.2);

  const saving =
    mrp - price;

  useEffect(() => {
    const cart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const item = cart.find(
      (x: any) => x.id === id
    );

    if (item) {
      setQty(item.qty || 0);

      if (item.selectedPack) {
        setSelectedPack(
          item.selectedPack
        );
      }
    }
  }, [id]);

  function saveCart(
    newQty: number
  ) {
    let cart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    if (newQty <= 0) {
      cart = cart.filter(
        (x: any) => x.id !== id
      );
    } else {
      const exists = cart.find(
        (x: any) => x.id === id
      );

      if (exists) {
        cart = cart.map(
          (x: any) =>
            x.id === id
              ? {
                  ...x,
                  qty: newQty,
                  selectedPack,
                }
              : x
        );
      } else {
        cart.push({
          id,
          name,
          image,
          price,
          qty: newQty,
          selectedPack,
        });
      }
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }

  function increase() {
    const q = qty + 1;

    setQty(q);

    saveCart(q);
  }

  function decrease() {
    const q =
      qty > 0 ? qty - 1 : 0;

    setQty(q);

    saveCart(q);
  }

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition flex flex-col h-full">

      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-24 object-contain p-2 hover:scale-105 transition duration-300"
        />
      )}

      <h3 className="font-semibold text-sm mt-2 line-clamp-2 min-h-[40px]">
        {name}
      </h3>

      <div className="mt-2">
        <label className="text-xs text-gray-500">
          Pack
        </label>

        <select
          value={selectedPack}
          onChange={(e) =>
            setSelectedPack(
              e.target.value
            )
          }
          className="w-full border rounded px-2 py-1 text-sm mt-1"
        >
          <option>
            250g
          </option>

          <option>
            500g
          </option>

          <option>
            1kg
          </option>
        </select>
      </div>

      <div className="mt-2">
        <div className="text-xs text-gray-400 line-through">
          MRP ₹{mrp}
        </div>

        <div className="text-green-600 font-bold">
          Our Price ₹{price}
        </div>

        <div className="text-xs text-red-500">
          Save ₹{saving}
        </div>
      </div>

      {qty === 0 ? (
        <button
          onClick={() => {
            setQty(1);
            saveCart(1);
          }}
          className="w-full mt-2 bg-green-600 text-white py-1 rounded-lg text-xs font-semibold"
        >
          Add
        </button>
      ) : (
        <div className="flex items-center justify-between mt-3 border rounded-lg">

          <button
            onClick={decrease}
            className="w-8 h-8 text-sm"
          >
            -
          </button>

          <span className="font-bold">
            {qty}
          </span>

          <button
            onClick={increase}
            className="w-8 h-8 text-green-600 font-bold text-sm"
          >
            +
          </button>

        </div>
      )}

    </div>
  );
}







