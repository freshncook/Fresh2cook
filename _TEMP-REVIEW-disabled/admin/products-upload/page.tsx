"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

export default function ProductUploadPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [pack, setPack] = useState("");
  const [image, setImage] = useState("");

  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  }

  function saveProduct() {
    if (!name || !price) {
      alert(
        "Name and Price Required"
      );
      return;
    }

    const products = JSON.parse(
      localStorage.getItem(
        "freshcut-products"
      ) || "[]"
    );

    products.unshift({
      id: Date.now(),
      name,
      price: Number(price),
      stock,
      pack,
      image,
    });

    localStorage.setItem(
      "freshcut-products",
      JSON.stringify(products)
    );

    alert(
      "Product Saved Successfully"
    );

    setName("");
    setPrice("");
    setStock("");
    setPack("");
    setImage("");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h1 className="text-4xl font-bold mb-8">
            Upload Product
          </h1>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Product Name"
              className="border p-3 rounded-xl"
            />

            <input
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              placeholder="Price"
              className="border p-3 rounded-xl"
            />

            <input
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
              placeholder="Stock"
              className="border p-3 rounded-xl"
            />

            <input
              value={pack}
              onChange={(e) =>
                setPack(
                  e.target.value
                )
              }
              placeholder="Pack Size"
              className="border p-3 rounded-xl"
            />

          </div>

          <div className="mt-6">

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

          </div>

          {image && (

            <div className="mt-6">

              <img
                src={image}
                alt="Preview"
                className="w-64 rounded-2xl border shadow"
              />

            </div>

          )}

          <button
            onClick={saveProduct}
            className="mt-8 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Save Product
          </button>

        </div>

      </div>

    </div>
  );
}








