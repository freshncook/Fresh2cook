"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

type Feedback = {
  id: number;
  customer: string;
  phone: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] =
    useState<Feedback[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [ratingFilter, setRatingFilter] =
    useState("All");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await fetch("/api/feedback", {
          cache: "no-store",
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load feedback"
        );
      }

      setFeedback(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "LOAD FEEDBACK ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load feedback"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredFeedback =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return feedback.filter(
        (item) => {
          const matchesSearch =
            !query ||
            item.customer
              .toLowerCase()
              .includes(query) ||
            item.phone
              .toLowerCase()
              .includes(query) ||
            item.comment
              .toLowerCase()
              .includes(query);

          const matchesRating =
            ratingFilter === "All" ||
            item.rating ===
              Number(ratingFilter);

          return (
            matchesSearch &&
            matchesRating
          );
        }
      );
    }, [
      feedback,
      search,
      ratingFilter,
    ]);

  const averageRating =
    feedback.length > 0
      ? (
          feedback.reduce(
            (sum, item) =>
              sum +
              Number(
                item.rating || 0
              ),
            0
          ) / feedback.length
        ).toFixed(1)
      : "0.0";

  const fiveStarCount =
    feedback.filter(
      (item) =>
        item.rating === 5
    ).length;

  const fourStarCount =
    feedback.filter(
      (item) =>
        item.rating === 4
    ).length;

  function openWhatsApp(
    item: Feedback
  ) {
    const number =
      item.phone.replace(
        /\D/g,
        ""
      );

    if (!number) {
      alert(
        "Customer mobile number is not available."
      );
      return;
    }

    const whatsappNumber =
      number.length === 10
        ? `91${number}`
        : number;

    const message = [
      `Hello ${item.customer},`,
      "",
      "Thank you for your valuable feedback for Fresh2Cook! ÃƒÂ¢Ã‚ÂÃ‚Â¤ÃƒÂ¯Ã‚Â¸Ã‚Â",
      "",
      `Your Rating: ${item.rating}/5 ÃƒÂ¢Ã‚Â­Ã‚Â`,
      `Your Review: ${item.comment}`,
      "",
      "We truly appreciate your support.",
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Customer Feedback & Reviews
            </h1>

            <p className="text-gray-500 mt-1">
              View customer ratings and reviews for Fresh2Cook.
            </p>

          </div>

          <button
            onClick={loadFeedback}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            Refresh Reviews
          </button>

        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl shadow p-5">

            <div className="text-sm text-gray-500">
              Total Reviews
            </div>

            <div className="text-3xl font-extrabold mt-1">
              {feedback.length}
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-5">

            <div className="text-sm text-gray-500">
              Average Rating
            </div>

            <div className="text-3xl font-extrabold text-yellow-500 mt-1">
              {averageRating} ÃƒÂ¢Ã‚Â­Ã‚Â
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-5">

            <div className="text-sm text-gray-500">
              5 Star Reviews
            </div>

            <div className="text-3xl font-extrabold text-green-600 mt-1">
              {fiveStarCount}
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-5">

            <div className="text-sm text-gray-500">
              4 Star Reviews
            </div>

            <div className="text-3xl font-extrabold text-blue-600 mt-1">
              {fourStarCount}
            </div>

          </div>

        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Search customer, mobile or review..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="flex-1 border border-gray-200 rounded-xl p-4 outline-none focus:border-green-500"
            />

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value
                )
              }
              className="border border-gray-200 rounded-xl p-4 outline-none focus:border-green-500"
            >

              <option value="All">
                All Ratings
              </option>

              <option value="5">
                5 Stars
              </option>

              <option value="4">
                4 Stars
              </option>

              <option value="3">
                3 Stars
              </option>

              <option value="2">
                2 Stars
              </option>

              <option value="1">
                1 Star
              </option>

            </select>

          </div>

        </div>

        {/* REVIEWS */}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            Loading Reviews...
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">

            <div className="text-6xl mb-4">
              ÃƒÂ¢Ã‚Â­Ã‚Â
            </div>

            <h2 className="text-2xl font-bold">
              No Reviews Found
            </h2>

            <p className="text-gray-500 mt-2">
              Customer feedback will appear here.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">

            {filteredFeedback.map(
              (item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold">
                        {item.customer}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â± {item.phone}
                      </p>

                    </div>

                    <div className="text-right">

                      <div className="text-yellow-500 text-xl">
                        {"ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦".repeat(
                          Math.max(
                            0,
                            Math.min(
                              5,
                              Number(
                                item.rating
                              )
                            )
                          )
                        )}
                      </div>

                      <div className="text-xs text-gray-400">
                        {new Date(
                          item.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                    </div>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 mt-5">

                    <p className="text-gray-700 leading-7">
                      ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ{item.comment}ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      openWhatsApp(item)
                    }
                    className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                  >
                    WhatsApp Customer
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}







