"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function changePassword() {
    const session =
      localStorage.getItem(
        "delivery-session"
      );

    if (!session) {
      alert(
        "Please Login Again"
      );

      window.location.href =
        "/delivery/login";

      return;
    }

    const rider =
      JSON.parse(session);

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "Passwords Do Not Match"
      );
      return;
    }

    if (
      newPassword.length < 4
    ) {
      alert(
        "Password Must Be At Least 4 Characters"
      );
      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/delivery-change-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              riderId:
                rider.id,
              oldPassword,
              newPassword,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed"
        );
        return;
      }

      alert(
        "Password Changed Successfully"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      window.location.href =
        "/delivery/profile";
    } catch (error) {
      console.error(error);

      alert(
        "Something Went Wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">

      <div className="max-w-xl mx-auto">

        <div className="bg-white rounded-xl shadow p-8">

          <h1 className="text-3xl font-bold mb-8">
            Change Password
          </h1>

          <div className="space-y-5">

            <div>
              <label className="font-medium">
                Current Password
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) =>
                  setOldPassword(
                    e.target.value
                  )
                }
                className="w-full mt-2 border p-3 rounded-xl"
                placeholder="Current Password"
              />
            </div>

            <div>
              <label className="font-medium">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="w-full mt-2 border p-3 rounded-xl"
                placeholder="New Password"
              />
            </div>

            <div>
              <label className="font-medium">
                Confirm Password
              </label>

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full mt-2 border p-3 rounded-xl"
                placeholder="Confirm Password"
              />
            </div>

            <button
              onClick={
                changePassword
              }
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/delivery/profile")
              }
              className="w-full bg-gray-200 py-3 rounded-xl font-bold"
            >
              Back To Profile
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}




