"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";

export default function UploadDocumentsPage() {
  const [aadharFile, setAadharFile] =
    useState("");

  const [licenseFile, setLicenseFile] =
    useState("");

  const [rcFile, setRcFile] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function saveDocuments() {
    const session =
      localStorage.getItem(
        "delivery-session"
      );

    if (!session) {
      alert(
        "Please Login First"
      );
      return;
    }

    const rider =
      JSON.parse(
        session
      );

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/upload-rider-document",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              riderId:
                rider.id,

              aadharFile,

              licenseFile,

              rcFile,

              photo,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error
        );
        return;
      }

      alert(
        "Documents Uploaded Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-6">
          Upload Documents
        </h1>

        <div className="space-y-5">

          <FileUploader
            label="Aadhar Card"
            onUploaded={
              setAadharFile
            }
          />

          {aadharFile && (
            <p className="text-green-600 text-sm">
              Uploaded
            </p>
          )}

          <FileUploader
            label="Driving License"
            onUploaded={
              setLicenseFile
            }
          />

          {licenseFile && (
            <p className="text-green-600 text-sm">
              Uploaded
            </p>
          )}

          <FileUploader
            label="Vehicle RC"
            onUploaded={
              setRcFile
            }
          />

          {rcFile && (
            <p className="text-green-600 text-sm">
              Uploaded
            </p>
          )}

          <FileUploader
            label="Profile Photo"
            onUploaded={
              setPhoto
            }
          />

          {photo && (
            <img
              src={photo}
              alt="Profile"
              className="w-28 h-28 rounded-xl border object-cover"
            />
          )}

          <button
            onClick={
              saveDocuments
            }
            disabled={
              loading
            }
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
          >
            {loading
              ? "Saving..."
              : "Submit Documents"}
          </button>

        </div>

      </div>

    </div>
  );
}




