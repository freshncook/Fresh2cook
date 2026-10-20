"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [assignmentId, setAssignmentId] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("assignmentId");

    if (id) {
      setAssignmentId(id);
    }
  }, []);

  async function sendOtp() {
    if (!assignmentId) {
      setMessage("Assignment ID required");
      return;
    }

    setResending(true);
    setMessage("");

    try {
      const res = await fetch("/api/rider-start-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: Number(assignmentId),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "OTP भेजा नहीं जा सका");
        return;
      }

      setMessage(
        "नया OTP customer को भेज दिया गया है। Customer से OTP लेकर नीचे डालें।"
      );
    } catch {
      setMessage("OTP भेजने में समस्या हुई");
    } finally {
      setResending(false);
    }
  }

  async function verifyOtp() {
    if (!assignmentId || !otp) {
      setMessage("OTP डालना जरूरी है");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/rider-complete-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: Number(assignmentId),
          otp,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "Invalid OTP");
        return;
      }

      setMessage(
        "Delivery Completed ✅ ₹25 earning added."
      );
    } catch {
      setMessage("Delivery complete करने में समस्या हुई");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-2">
        Delivery OTP
      </h1>

      <p className="text-gray-600 mb-6">
        Customer से OTP लेकर delivery complete करें।
      </p>

      <div className="bg-white rounded-2xl shadow p-5">

        <label className="block text-sm font-semibold mb-2">
          Assignment ID
        </label>

        <input
          className="border p-3 rounded-xl w-full mb-4"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          placeholder="Assignment ID"
        />

        <button
          onClick={sendOtp}
          disabled={resending}
          className="w-full bg-orange-600 text-white p-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : "Send / Resend OTP to Customer"}
        </button>

        <div className="my-5 border-t" />

        <label className="block text-sm font-semibold mb-2">
          Customer OTP
        </label>

        <input
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          placeholder="Enter 4 Digit OTP"
          inputMode="numeric"
          maxLength={4}
          className="border p-3 w-full rounded-xl text-center text-2xl tracking-[0.5em]"
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="mt-4 w-full bg-green-600 text-white p-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP & Complete Delivery"}
        </button>

        {message && (
          <div className="mt-5 bg-gray-50 border rounded-xl p-4 text-sm">
            {message}
          </div>
        )}

      </div>

      <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
        <b>ध्यान दें:</b> Rider को OTP screen पर OTP दिखाई नहीं जाएगा।
        OTP केवल customer को भेजा जाएगा।
      </div>

    </div>
  );
}




