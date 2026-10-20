"use client";

import { useState } from "react";

export default function DeliveryLoginPage() {
  const [mobile, setMobile] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  async function login() {
    if (
      !mobile ||
      !password
    ) {
      alert(
        "Enter Mobile & Password"
      );
      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/delivery-login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              mobile,
              password,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message
        );
        return;
      }

      localStorage.setItem(
        "delivery-rider",
        JSON.stringify(
          data.rider
        )
      );

      alert(
        "Login Successful"
      );

      window.location.href =
        "/delivery/dashboard";
    } catch (error) {
      console.error(error);

      alert(
        "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">

      <div className="bg-white border shadow rounded-xl p-8 mt-10">

        <h1 className="text-3xl font-bold mb-2">
          Delivery Partner Login
        </h1>

        <p className="text-gray-500 mb-6">
          Login To Start Deliveries
        </p>

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-xl mb-6"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold"
        >
          {loading
            ? "Please Wait..."
            : "Login"}
        </button>

      </div>

    </div>
  );
}




