"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setPhone(
      localStorage.getItem(
        "freshcut-phone"
      ) || ""
    );
  }, []);

  function logout() {
    localStorage.removeItem(
      "freshcut-login"
    );

    window.location.href =
      "/login";
  }

  return (
    <div className="max-w-5xl mx-auto p-4">

      <h1 className="text-3xl font-bold mb-5">
        My Account
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500">
            Mobile
          </div>
          <div className="font-bold">
            {phone}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500">
            Wallet
          </div>
          <div className="font-bold">
            ₹0
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500">
            Orders
          </div>
          <div className="font-bold">
            View Orders
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500">
            Referral
          </div>
          <div className="font-bold">
            Coming Soon
          </div>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <a
          href="/orders"
          className="bg-white rounded-xl p-5 shadow"
        >
          Order History
        </a>

        <a
          href="/wallet"
          className="bg-white rounded-xl p-5 shadow"
        >
          Wallet
        </a>

        <a
          href="/address-book"
          className="bg-white rounded-xl p-5 shadow"
        >
          Address Book
        </a>

        <a
          href="/offers"
          className="bg-white rounded-xl p-5 shadow"
        >
          Offers
        </a>

      </div>

      <button
        onClick={logout}
        className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl"
      >
        Logout
      </button>

    </div>
  );
}

