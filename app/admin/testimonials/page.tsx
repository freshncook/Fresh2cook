"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [rating, setRating] =
    useState("5");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadTestimonials();
  }, []);

  function loadTestimonials() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-testimonials"
      ) || "[]"
    );

    setTestimonials(data);
  }

  function addTestimonial() {
    if (
      !name ||
      !message
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const testimonial = {
      id: Date.now(),
      name,
      rating,
      message,
      status: "Approved",
      date:
        new Date().toLocaleDateString(),
    };

    const updated = [
      testimonial,
      ...testimonials,
    ];

    localStorage.setItem(
      "freshcut-testimonials",
      JSON.stringify(updated)
    );

    setTestimonials(updated);

    setName("");
    setRating("5");
    setMessage("");

    alert(
      "Testimonial Added Successfully"
    );
  }

  function toggleStatus(
    id: number
  ) {
    const updated =
      testimonials.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                status:
                  item.status ===
                  "Approved"
                    ? "Pending"
                    : "Approved",
              }
            : item
      );

    localStorage.setItem(
      "freshcut-testimonials",
      JSON.stringify(updated)
    );

    setTestimonials(updated);
  }

  function deleteTestimonial(
    id: number
  ) {
    if (
      !confirm(
        "Delete Review?"
      )
    )
      return;

    const updated =
      testimonials.filter(
        (item) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-testimonials",
      JSON.stringify(updated)
    );

    setTestimonials(updated);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Testimonials Manager
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Add Review
          </h2>

          <div className="grid gap-5">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Customer Name"
              className="border p-3 rounded-2xl"
            />

            <select
              value={rating}
              onChange={(e) =>
                setRating(
                  e.target.value
                )
              }
              className="border p-3 rounded-2xl"
            >
              <option value="5">
                ⭐⭐⭐⭐⭐
              </option>

              <option value="4">
                ⭐⭐⭐⭐
              </option>

              <option value="3">
                ⭐⭐⭐
              </option>

              <option value="2">
                ⭐⭐
              </option>

              <option value="1">
                ⭐
              </option>

            </select>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              rows={4}
              placeholder="Customer Review"
              className="border p-3 rounded-2xl"
            />

          </div>

          <button
            onClick={
              addTestimonial
            }
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Save Review
          </button>

        </div>

        <div className="space-y-6">

          {testimonials.map(
            (item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex justify-between">

                  <div>

                    <h2 className="text-xl font-bold">
                      {item.name}
                    </h2>

                    <p className="mt-2">
                      {"⭐".repeat(
                        Number(
                          item.rating
                        )
                      )}
                    </p>

                    <p className="mt-3 text-gray-600">
                      {
                        item.message
                      }
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      {item.date}
                    </p>

                  </div>

                  <div className="flex flex-col gap-2">

                    <button
                      onClick={() =>
                        toggleStatus(
                          item.id
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-2xl"
                    >
                      {item.status}
                    </button>

                    <button
                      onClick={() =>
                        deleteTestimonial(
                          item.id
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-2xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}











