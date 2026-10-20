"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [customer, setCustomer] = useState("");
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  function loadReviews() {
    try {
      setReviews(
        JSON.parse(localStorage.getItem("freshcut-reviews") || "[]")
      );
    } catch {
      setReviews([]);
    }
  }

  function addReview() {
    if (!customer.trim() || !review.trim()) {
      alert("Fill All Fields");
      return;
    }

    const newReview = {
      id: Date.now(),
      customer: customer.trim(),
      rating,
      review: review.trim(),
      date: new Date().toLocaleDateString(),
    };

    const updated = [newReview, ...reviews];

    localStorage.setItem("freshcut-reviews", JSON.stringify(updated));
    setReviews(updated);
    setCustomer("");
    setRating("5");
    setReview("");
  }

  function deleteReview(id: number) {
    if (!confirm("Delete Review?")) return;

    const updated = reviews.filter((item) => item.id !== id);

    localStorage.setItem("freshcut-reviews", JSON.stringify(updated));
    setReviews(updated);
  }

  const averageRating = reviews.length
    ? (
        reviews.reduce(
          (sum, item) => sum + Number(item.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Fresh2Cook Admin
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">
            Customer Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer feedback and ratings.
          </p>
        </div>

        <div className="mb-7 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <p className="text-sm font-semibold text-slate-500">
              Total Reviews
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#123b38]">
              {reviews.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-md">
            <p className="text-sm font-semibold text-amber-700">
              Average Rating
            </p>
            <p className="mt-2 text-3xl font-extrabold text-amber-800">
              {averageRating} / 5
            </p>
          </div>
        </div>

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="text-lg font-extrabold text-[#123b38]">
            Add Customer Review
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer Name"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
            >
              <option value="5">★★★★★ — 5 Stars</option>
              <option value="4">★★★★☆ — 4 Stars</option>
              <option value="3">★★★☆☆ — 3 Stars</option>
              <option value="2">★★☆☆☆ — 2 Stars</option>
              <option value="1">★☆☆☆☆ — 1 Star</option>
            </select>

            <button
              onClick={addReview}
              className="rounded-2xl bg-[#063f3d] px-6 py-3 text-sm font-bold text-white hover:bg-[#0a514d]"
            >
              + Add Review
            </button>
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Customer Review"
            rows={4}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="font-extrabold text-[#123b38]">
                    {item.customer}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.date}
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  {"★".repeat(Number(item.rating || 0))}
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                {item.review}
              </p>

              <button
                onClick={() => deleteReview(item.id)}
                className="mt-5 w-full rounded-2xl bg-red-50 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
              >
                Delete Review
              </button>
            </div>
          ))}

          {!reviews.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No customer reviews available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}









