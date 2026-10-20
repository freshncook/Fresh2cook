"use client";

import { useState } from "react";

interface Props {
  label: string;
  onUploaded: (
    url: string
  ) => void;
}

export default function FileUploader({
  label,
  onUploaded,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function uploadFile(
    file: File
  ) {
    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const res =
        await fetch(
          "/api/upload-file",
          {
            method: "POST",
            body: formData,
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

      onUploaded(
        data.url
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
    <div>

      <label className="block mb-2 font-semibold">
        {label}
      </label>

      <input
        type="file"
        className="w-full border p-3 rounded-xl"
        onChange={(e) => {
          const file =
            e.target.files?.[0];

          if (file) {
            uploadFile(
              file
            );
          }
        }}
      />

      {loading && (
        <p className="mt-2 text-blue-600">
          Uploading...
        </p>
      )}

    </div>
  );
}



