"use client";

import { useState } from "react";
import Link from "next/link";

export default function DeliveryRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    vehicle: "",

    address1: "",
    address2: "",

    city: "New Delhi",
    pincode: "110018",
  });

  const [loading, setLoading] =
    useState(false);

  async function register() {
    if (
      !form.name ||
      !form.mobile ||
      !form.password ||
      !form.vehicle
    ) {
      alert(
        "Please Fill Required Fields"
      );
      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/delivery-register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Registration Failed"
        );
        return;
      }

      alert(
        "Registration Submitted Successfully. Wait For Admin Approval."
      );

      window.location.href =
        "/delivery/login";
    } catch (error) {
      console.error(error);

      alert(
        "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border p-8 md:p-10">

        <h1 className="text-4xl font-bold mb-2">
          Delivery Partner Registration
        </h1>

        <p className="text-gray-500 mb-8">
          Register & Upload Documents
        </p>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            placeholder="Vehicle Type (Bike/Scooter)"
            value={form.vehicle}
            onChange={(e) =>
              setForm({
                ...form,
                vehicle:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-5">

          <input
            placeholder="Address Line 1"
            value={form.address1}
            onChange={(e) =>
              setForm({
                ...form,
                address1:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            placeholder="Address Line 2"
            value={form.address2}
            onChange={(e) =>
              setForm({
                ...form,
                address2:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

          <input
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) =>
              setForm({
                ...form,
                pincode:
                  e.target.value,
              })
            }
            className="border p-4 rounded-xl"
          />

        </div>

        <div className="mt-8">

          <Link
            href="/delivery/upload-documents"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
          >
            Upload Documents
          </Link>

          <div className="mt-4 text-sm text-gray-600 bg-gray-50 border rounded-xl p-4">

            <div>
              ✅ Profile Photo
            </div>

            <div>
              ✅ Aadhaar Front
            </div>

            <div>
              ✅ Aadhaar Back
            </div>

            <div>
              ✅ PAN Card
            </div>

            <div>
              ✅ Driving License
            </div>

            <div>
              ✅ RC
            </div>

          </div>

        </div>

        <button
          onClick={register}
          disabled={loading}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg"
        >
          {loading
            ? "Submitting..."
            : "Register Now"}
        </button>

      </div>
    </div>
  );
}




