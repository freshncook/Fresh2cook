"use client";

import { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";

export default function DeliveryProfilePage() {
  const [rider, setRider] =
    useState<any>(null);

  const [vehicle, setVehicle] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  const [aadharFile, setAadharFile] =
    useState("");

  const [licenseFile, setLicenseFile] =
    useState("");

  const [rcFile, setRcFile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const session =
      localStorage.getItem(
        "delivery-session"
      );

    if (!session) {
      window.location.href =
        "/delivery/login";
      return;
    }

    const data =
      JSON.parse(session);

    const riderData =
      data.rider || data;

    setRider(riderData);

    setVehicle(
      riderData.vehicle || ""
    );

    setPhoto(
      riderData.photo || ""
    );

    setAadharFile(
      riderData.aadharFile || ""
    );

    setLicenseFile(
      riderData.licenseFile || ""
    );

    setRcFile(
      riderData.rcFile || ""
    );
  }

  async function saveProfile() {
    if (!rider?.id) return;

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/update-rider-profile",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              riderId:
                rider.id,
              vehicle,
              photo,
              aadharFile,
              licenseFile,
              rcFile,
              password,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Update Failed"
        );
        return;
      }

      alert(
        "Profile Updated Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Update Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">
          Rider Profile
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block font-semibold mb-2">
              Name
            </label>

            <input
              value={
                rider?.name || ""
              }
              disabled
              className="w-full border p-3 rounded-xl bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Mobile Number
            </label>

            <input
              value={
                rider?.mobile || ""
              }
              disabled
              className="w-full border p-3 rounded-xl bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Vehicle Number
            </label>

            <input
              value={vehicle}
              onChange={(e) =>
                setVehicle(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Leave Empty If No Change"
              className="w-full border p-3 rounded-xl"
            />
          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-5">
            Profile Photo
          </h2>

          <FileUploader
            label="Upload Profile Photo"
            onUploaded={
              setPhoto
            }
          />

          {photo && (
            <img
              src={photo}
              alt="Profile"
              className="w-32 h-32 rounded-xl mt-4 object-cover border"
            />
          )}

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-5">
            Documents
          </h2>

          <div className="space-y-6">

            <FileUploader
              label="Aadhaar Card"
              onUploaded={
                setAadharFile
              }
            />

            {aadharFile && (
              <a
                href={
                  aadharFile
                }
                target="_blank"
                className="text-blue-600"
              >
                View Aadhaar
              </a>
            )}

            <FileUploader
              label="Driving License"
              onUploaded={
                setLicenseFile
              }
            />

            {licenseFile && (
              <a
                href={
                  licenseFile
                }
                target="_blank"
                className="text-blue-600"
              >
                View License
              </a>
            )}

            <FileUploader
              label="Vehicle RC"
              onUploaded={
                setRcFile
              }
            />

            {rcFile && (
              <a
                href={rcFile}
                target="_blank"
                className="text-blue-600"
              >
                View RC
              </a>
            )}

          </div>

        </div>

        <button
          onClick={
            saveProfile
          }
          disabled={loading}
          className="mt-8 w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg"
        >
          {loading
            ? "Saving..."
            : "Save Profile"}
        </button>

      </div>

    </div>
  );
}




