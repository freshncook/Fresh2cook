"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

export default function ImportProductsPage() {
  const [csvData, setCsvData] =
    useState("");

  function importProducts() {
    if (!csvData) {
      alert("Paste CSV Data");
      return;
    }

    const rows =
      csvData.trim().split("\n");

    const products =
      JSON.parse(
        localStorage.getItem(
          "freshcut-products"
        ) || "[]"
      );

    rows.forEach((row) => {
      const cols = row.split(",");

      if (cols.length >= 5) {
        products.push({
          id: Date.now() + Math.random(),
          name: cols[0],
          price: Number(cols[1]),
          stock: cols[2],
          pack: cols[3],
          image: cols[4],
        });
      }
    });

    localStorage.setItem(
      "freshcut-products",
      JSON.stringify(products)
    );

    alert(
      "Products Imported Successfully"
    );

    setCsvData("");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h1 className="text-4xl font-bold mb-6">
            Bulk Product Import
          </h1>

          <div className="bg-yellow-50 border rounded-2xl p-4 mb-6">

            <p className="font-bold">
              CSV Format
            </p>

            <p>
              Name,Price,Stock,Pack,ImageURL
            </p>

            <p>
              Bhindi,49,100,500gm,https://image.jpg
            </p>

          </div>

          <textarea
            value={csvData}
            onChange={(e) =>
              setCsvData(
                e.target.value
              )
            }
            rows={15}
            className="w-full border rounded-2xl p-4"
            placeholder="Paste CSV Here..."
          />

          <button
            onClick={importProducts}
            className="mt-6 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Import Products
          </button>

        </div>

      </div>

    </div>
  );
}











