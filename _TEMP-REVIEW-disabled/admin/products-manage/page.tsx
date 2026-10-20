"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category?: string;
  pack?: string;
  mrp?: number;
  price?: number;
  stock?: number;
  image?: string;
  description?: string;
  bestSeller?: boolean;
  active?: boolean;
};

type ProductForm = {
  name: string;
  category: string;
  pack: string;
  mrp: string;
  price: string;
  stock: string;
  image: string;
  description: string;
  bestSeller: boolean;
  active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  category: "Vegetables",
  pack: "Piece",
  mrp: "",
  price: "",
  stock: "",
  image: "",
  description: "",
  bestSeller: false,
  active: true,
};

async function getResponseData(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] =
    useState<ProductForm>(emptyForm);

  const [editForm, setEditForm] =
    useState<ProductForm>(emptyForm);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load products"
        );
      }

      const list = Array.isArray(data)
        ? data
        : data?.products || [];

      setProducts(list);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  function validateForm(form: ProductForm) {
    const name = form.name.trim();
    const pack = form.pack.trim();
    const mrp = Number(form.mrp || 0);
    const price = Number(form.price || 0);
    const stock = Number(form.stock || 0);

    if (!name) {
      return "Please enter Product Name.";
    }

    if (!pack) {
      return "Please enter Pack Size.";
    }

    if (!Number.isFinite(mrp) || mrp < 0) {
      return "Please enter a valid MRP.";
    }

    if (!Number.isFinite(price) || price < 0) {
      return "Please enter a valid Our Price.";
    }

    if (mrp < price) {
      return "MRP cannot be less than Our Price.";
    }

    if (!Number.isFinite(stock) || stock < 0) {
      return "Please enter a valid Stock.";
    }

    return "";
  }

  async function addProduct() {
    const validationError = validateForm(newProduct);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          category: newProduct.category,
          pack: newProduct.pack,
          mrp: Number(newProduct.mrp || 0),
          price: Number(newProduct.price || 0),
          stock: Number(newProduct.stock || 0),
          image: newProduct.image.trim(),
          description: newProduct.description.trim(),
          bestSeller: newProduct.bestSeller,
          active: newProduct.active,
        }),
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to add product"
        );
      }

      const created = data?.product || data;

      setProducts((current) => [
        created,
        ...current,
      ]);

      setNewProduct(emptyForm);

      alert("Product Added Successfully");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to add product"
      );
    } finally {
      setSaving(false);
    }
  }

  function openEdit(product: Product) {
    setEditingProduct(product);

    setEditForm({
      name: product.name || "",
      category: product.category || "Vegetables",
      pack: product.pack || "Piece",
      mrp: String(product.mrp ?? ""),
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image || "",
      description: product.description || "",
      bestSeller: product.bestSeller === true,
      active: product.active !== false,
    });

    setErrorMessage("");
  }

  function closeEdit() {
    setEditingProduct(null);
    setEditForm(emptyForm);
  }

  async function saveEdit() {
    if (!editingProduct) return;

    const validationError = validateForm(editForm);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/products/${editingProduct.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editForm.name.trim(),
            category: editForm.category,
            pack: editForm.pack,
            mrp: Number(editForm.mrp || 0),
            price: Number(editForm.price || 0),
            stock: Number(editForm.stock || 0),
            image: editForm.image.trim(),
            description: editForm.description.trim(),
            bestSeller: editForm.bestSeller,
            active: editForm.active,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update product"
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? data?.product || data
            : product
        )
      );

      closeEdit();

      alert("Product Updated Successfully");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleBestSeller(product: Product) {
    try {
      setErrorMessage("");

      const response = await fetch(
        `/api/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bestSeller: product.bestSeller !== true,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update Best Seller"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? data?.product || data
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update Best Seller"
      );
    }
  }

  async function toggleActive(product: Product) {
    try {
      setErrorMessage("");

      const response = await fetch(
        `/api/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: product.active === false,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update status"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? data?.product || data
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");

      const response = await fetch(
        `/api/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete product"
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete product"
      );
    }
  }

  function handleNewImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setNewProduct((current) => ({
        ...current,
        image: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleEditImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditForm((current) => ({
        ...current,
        image: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  }

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean) as string[];

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        product.name
          ?.toLowerCase()
          .includes(keyword) ||
        product.category
          ?.toLowerCase()
          .includes(keyword) ||
        product.pack
          ?.toLowerCase()
          .includes(keyword);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"
          ? product.active !== false
          : product.active === false);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.active !== false
  ).length;

  const bestSellers = products.filter(
    (product) => product.bestSeller === true
  ).length;

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) <= 5
  ).length;

  const newSaving = Math.max(
    Number(newProduct.mrp || 0) -
      Number(newProduct.price || 0),
    0
  );

  const editSaving = Math.max(
    Number(editForm.mrp || 0) -
      Number(editForm.price || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f4f7f7] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#063f3d] to-[#0b625c] px-6 py-7 text-white">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                  ??
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Product Management
                  </h1>

                  <p className="text-sm text-white/70 mt-1">
                    Add, edit and manage Fresh2Cook products
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={loadProducts}
                  className="bg-white text-[#063f3d] px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  ? Refresh
                </button>

                <a
                  href="/admin/bulk-products"
                  className="bg-[#159447] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#117b3b] transition"
                >
                  + Bulk Add
                </a>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Products
              </p>
              <p className="text-2xl font-bold text-[#063f3d] mt-1">
                {totalProducts}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Active
              </p>
              <p className="text-2xl font-bold text-[#159447] mt-1">
                {activeProducts}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Best Sellers
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {bestSellers}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Low Stock
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {lowStock}
              </p>
            </div>

          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* ADD PRODUCT */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#063f3d]">
                Add New Product
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new Fresh2Cook product
              </p>
            </div>

            <div className="hidden md:flex w-10 h-10 rounded-xl bg-green-50 text-[#159447] items-center justify-center text-xl">
              +
            </div>
          </div>

          <div className="p-6">

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                placeholder="Product Name"
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/10"
              />

              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              >
                <option>Vegetables</option>
                <option>Ready To Cook</option>
                <option>Salads</option>
                <option>Combo Packs</option>
                <option>Fruits</option>
              </select>

              <select
                value={newProduct.pack}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    pack: e.target.value,
                  })
                }
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              >
                <option value="Piece">Piece</option>
                <option value="250g">250g</option>
                <option value="500g">500g</option>
                <option value="1kg">1kg</option>
              </select>

              <input
                type="number"
                value={newProduct.mrp}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    mrp: e.target.value,
                  })
                }
                placeholder="MRP"
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              />

              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
                placeholder="Our Price"
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              />

              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value,
                  })
                }
                placeholder="Stock"
                className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              />

              <div className="md:col-span-2 xl:col-span-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewImage}
                  className="w-full text-sm"
                />

                {newProduct.image && (
                  <img
                    src={newProduct.image}
                    alt="Preview"
                    className="mt-3 h-24 w-24 object-cover rounded-xl border"
                  />
                )}
              </div>

              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
                placeholder="Product Description"
                rows={4}
                className="md:col-span-2 xl:col-span-3 border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
              />

            </div>

            <div className="mt-5 grid md:grid-cols-3 gap-4">

              <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Customer Saving
                </p>

                <p className="text-2xl font-extrabold text-[#159447] mt-1">
                  ?{newSaving}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  MRP - Our Price
                </p>
              </div>

              <label className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.bestSeller}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      bestSeller: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#159447]"
                />
                <span className="font-semibold">
                  Add to Best Sellers
                </span>
              </label>

              <label className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.active}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      active: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#159447]"
                />
                <span className="font-semibold">
                  Active Product
                </span>
              </label>

            </div>

            <div className="mt-5">
              <button
                onClick={addProduct}
                disabled={saving}
                className="bg-[#159447] hover:bg-[#117b3b] disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-bold transition"
              >
                {saving ? "Saving..." : "+ Add Product"}
              </button>
            </div>

          </div>
        </div>

        {/* EDIT PRODUCT */}
        {editingProduct && (
          <div className="bg-white border-2 border-[#159447] rounded-2xl shadow-md overflow-hidden">

            <div className="bg-[#063f3d] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Edit Product
                </h2>

                <p className="text-sm text-white/70 mt-1">
                  Update product details
                </p>
              </div>

              <button
                onClick={closeEdit}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="p-6">

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Product Name"
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                />

                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                    })
                  }
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                >
                  <option>Vegetables</option>
                  <option>Ready To Cook</option>
                  <option>Salads</option>
                  <option>Combo Packs</option>
                  <option>Fruits</option>
                </select>

                <select
                  value={editForm.pack}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      pack: e.target.value,
                    })
                  }
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                >
                  <option value="Piece">Piece</option>
                  <option value="250g">250g</option>
                  <option value="500g">500g</option>
                  <option value="1kg">1kg</option>
                </select>

                <input
                  type="number"
                  value={editForm.mrp}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      mrp: e.target.value,
                    })
                  }
                  placeholder="MRP"
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                />

                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: e.target.value,
                    })
                  }
                  placeholder="Our Price"
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                />

                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stock: e.target.value,
                    })
                  }
                  placeholder="Stock"
                  className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                />

                <div className="md:col-span-2 xl:col-span-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImage}
                    className="w-full text-sm"
                  />

                  {editForm.image && (
                    <img
                      src={editForm.image}
                      alt="Preview"
                      className="mt-3 h-24 w-24 object-cover rounded-xl border"
                    />
                  )}
                </div>

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product Description"
                  rows={4}
                  className="md:col-span-2 xl:col-span-3 border border-gray-200 bg-gray-50 p-3.5 rounded-xl outline-none focus:border-[#159447]"
                />

              </div>

              <div className="mt-5 grid md:grid-cols-3 gap-4">

                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Product Saving
                  </p>

                  <p className="text-2xl font-extrabold text-[#159447] mt-1">
                    ?{editSaving}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    MRP - Our Price
                  </p>
                </div>

                <label className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.bestSeller}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        bestSeller: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#159447]"
                  />
                  <span className="font-semibold">
                    Best Seller
                  </span>
                </label>

                <label className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        active: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#159447]"
                  />
                  <span className="font-semibold">
                    Active Product
                  </span>
                </label>

              </div>

              <button
                onClick={saveEdit}
                disabled={saving}
                className="mt-5 bg-[#159447] hover:bg-[#117b3b] disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-bold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ??
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#159447]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="lg:w-56 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#159447]"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="lg:w-48 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#159447]"
            >
              <option value="All">
                All Status
              </option>
              <option value="Active">
                Active
              </option>
              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Showing {filteredProducts.length} of{" "}
            {products.length} products
          </p>
        </div>

        {/* PRODUCT GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#063f3d]">
                Products
              </h2>
              <p className="text-sm text-gray-500">
                Manage your Fresh2Cook catalogue
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 font-semibold text-gray-500">
                Loading Products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mx-auto">
                ??
              </div>

              <h2 className="text-xl font-bold text-[#063f3d] mt-5">
                No Products Found
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">

              {filteredProducts.map((product) => {
                const productSaving = Math.max(
                  Number(product.mrp || 0) -
                    Number(product.price || 0),
                  0
                );

                const stock = Number(
                  product.stock || 0
                );

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-sm transition ${
                      product.bestSeller
                        ? "border-yellow-400"
                        : "border-gray-200"
                    }`}
                  >

                    <div className="relative h-36 bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">

                      <img
                        src={
                          product.image?.trim()
                            ? product.image
                            : "/placeholder-product.png"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder-product.png";
                        }}
                      />

                      {product.bestSeller && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                          BEST SELLER
                        </div>
                      )}

                      <div
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          product.active === false
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.active === false
                          ? "INACTIVE"
                          : "ACTIVE"}
                      </div>
                    </div>

                    <div className="p-4">

                      <h3 className="font-bold text-base text-gray-800 truncate">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {product.category || "Product"}
                        </p>

                        <p className="text-xs font-semibold text-[#063f3d]">
                          {product.pack}
                        </p>
                      </div>

                      <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1">

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            MRP
                          </span>

                          <span className="line-through text-gray-400">
                            ?{product.mrp || 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            Our Price
                          </span>

                          <span className="text-[#159447] font-bold">
                            ?{product.price || 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            Saving
                          </span>

                          <span className="text-red-600 font-bold">
                            ?{productSaving}
                          </span>
                        </div>

                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          Stock
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            stock <= 5
                              ? "text-red-600"
                              : "text-[#159447]"
                          }`}
                        >
                          {stock}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 mt-4">

                        <button
                          onClick={() =>
                            openEdit(product)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-[10px] font-bold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleBestSeller(product)
                          }
                          className={`py-2 rounded-lg text-[10px] font-bold ${
                            product.bestSeller
                              ? "bg-yellow-400 text-black"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          Best
                        </button>

                        <button
                          onClick={() =>
                            toggleActive(product)
                          }
                          className={`py-2 rounded-lg text-[10px] font-bold ${
                            product.active === false
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {product.active === false
                            ? "On"
                            : "Off"}
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(product)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-[10px] font-bold"
                        >
                          Del
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}






