"use client";

import { useState } from "react";

export default function CommandCenter() {
  const [loading, setLoading] =
    useState(false);

  async function smartAssign() {
    try {
      setLoading(true);

      await fetch(
        "/api/smart-assign-orders",
        {
          method: "POST",
        }
      );

      alert(
        "Smart Assignment Completed"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function autoReassign() {
    try {
      setLoading(true);

      await fetch(
        "/api/auto-reassign-orders",
        {
          method: "POST",
        }
      );

      alert(
        "Auto Reassignment Completed"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-4">
        <button
          onClick={
            smartAssign
          }
          disabled={loading}
          className="px-5 py-3 rounded-lg bg-black text-white"
        >
          Smart Assign
        </button>

        <button
          onClick={
            autoReassign
          }
          disabled={loading}
          className="px-5 py-3 rounded-lg bg-black text-white"
        >
          Auto Reassign
        </button>
      </div>
    </div>
  );
}




