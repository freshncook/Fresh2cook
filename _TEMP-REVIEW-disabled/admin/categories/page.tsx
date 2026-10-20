"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  image: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    try {
      const data = JSON.parse(
        localStorage.getItem("freshcut-categories") || "[]"
      );
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  function saveCategories(updated: Category[]) {
    localStorage.setItem(
      "freshcut-categories",
      JSON.stringify(updated)
    );
    setCategories(updated);
  }

  function addCategory() {
    if (!name.trim()) {
      alert("Enter Category Name");
      return;
    }

    const category: Category = {
      id: Date.now(),
      name: name.trim(),
      image,
    };

    saveCategories([category, ...categories]);
    setName("");
    setImage("");
    alert("Category Added Successfully");
  }

  function deleteCategory(id: number) {
    if (!confirm("Delete Category?")) return;

    saveCategories(
      categories.filter((category) => category.id !== id)
    );
  }

  async function uploadImage(file: File) {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.url || "";
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
      return "";
    } finally {
      setUploading(false);
    }
  }

  const filtered = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f7f8] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#159447]">
              Catalog Management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#123b39]">
              Product Categories
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage the categories displayed across Fresh2Cook.
            </p>
          </div>

          <button
            onClick={loadCategories}
            className="rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0a504c]"
          >
            â†» Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              Total Categories
            </p>
            <p className="mt-2 text-3xl font-bold text-[#123b39]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              With Images
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {categories.filter((c) => !!c.image).length}
            </p>
          </div>

          <div className="hidden md:block rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase font-semibold text-gray-400">
              Storage
            </p>
            <p className="mt-2 text-xl font-bold text-[#123b39]">
              Local Catalog
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#123b39]">
            Add Category
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category Name"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447]"
            />

            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const url = await uploadImage(file);
                setImage(url);
              }}
            />

            <div className="flex items-center">
              {image ? (
                <img
                  src={image}
                  alt="Preview"
                  className="h-12 w-12 rounded-xl border object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">
                  No image selected
                </span>
              )}
            </div>

            <button
              onClick={addCategory}
              disabled={uploading}
              className="rounded-xl bg-[#159447] px-5 py-3 text-sm font-bold text-white hover:bg-[#117b3b] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "+ Add Category"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123b39]">
                Category Library
              </h2>
              <p className="text-sm text-gray-500">
                {filtered.length} category(s)
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#159447] md:w-80"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-3"
              >
                <img
                  src={category.image || "/placeholder-product.png"}
                  alt={category.name}
                  className="h-28 w-full rounded-xl bg-white object-contain"
                />

                <input
                  value={category.name}
                  onChange={(e) => {
                    const updated = categories.map((c) =>
                      c.id === category.id
                        ? { ...c, name: e.target.value }
                        : c
                    );
                    saveCategories(updated);
                  }}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-semibold outline-none focus:border-[#159447]"
                />

                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const url = await uploadImage(file);

                    const updated = categories.map((c) =>
                      c.id === category.id
                        ? { ...c, image: url }
                        : c
                    );

                    saveCategories(updated);
                  }}
                />

                <button
                  onClick={() => deleteCategory(category.id)}
                  className="mt-3 w-full rounded-lg bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full p-10 text-center text-gray-500">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






