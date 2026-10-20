"use client";

import { useState } from "react";

export default function Page() {
  const [assignmentId, setAssignmentId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendAction(action: "accept" | "reject") {
    const id = Number(assignmentId);
    if (!Number.isInteger(id) || id <= 0) {
      setMessage("Valid Assignment ID enter karein.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/delivery-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ assignmentId: id, action }),
      });

      const data = await res.json();
      setMessage(data.message || data.error || (res.ok ? "Success" : "Request failed"));
    } catch {
      setMessage("Request failed. Internet connection check karein.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Accept / Reject Order</h1>
        <label className="mb-2 block text-sm font-medium">Assignment ID</label>
        <input
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          inputMode="numeric"
          placeholder="Enter Assignment ID"
          className="w-full rounded-lg border p-3"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => sendAction("accept")}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Accept"}
          </button>
          <button
            onClick={() => sendAction("reject")}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            Reject
          </button>
        </div>
        {message && <p role="status" className="mt-4 rounded-lg bg-slate-50 p-3">{message}</p>}
      </div>
    </main>
  );
}
