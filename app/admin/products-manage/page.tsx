"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useStoreSettings } from "@/lib/use-store-settings";
import { cleanPackLabel } from "@/lib/pack-price";

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
  cost: string; // purchase rate — admin only
};

const emptyForm: ProductForm = {
  name: "",
  category: "Vegetables",
  pack: "1kg",
  mrp: "",
  price: "",
  stock: "",
  image: "",
  description: "",
  bestSeller: false,
  active: true,
  cost: "",
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
  const shop = useStoreSettings(); // pack sizes from Admin > Settings
  const packChoices = (current?: string) =>
    Array.from(new Set(["1kg", "100g", "400g", "Piece", ...shop.packSizes.map((p) => p.label), ...(current ? [current] : [])]));
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

  // Categories from Admin > Categories (database) — same list as the home page
  const [adminCategories, setAdminCategories] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [costs, setCostMap] = useState<Record<string, number>>({});

  async function saveCost(id: number, cost: string) {
    try {
      const r = await fetch("/api/admin/product-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cost: cost.trim() === "" ? "" : Number(cost) }),
      });
      const j = await r.json();
      if (j?.costs) setCostMap(j.costs);
    } catch {
      /* ignore */
    }
  }
  const [overId, setOverId] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
    fetch("/api/admin/product-cost", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setCostMap(j?.costs || {}))
      .catch(() => undefined);
    fetch("/api/category-images", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setAdminCategories((j?.categories || []).map((c: { name: string }) => c.name)))
      .catch(() => setAdminCategories([]));
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
      if (created?.id && newProduct.cost.trim()) await saveCost(Number(created.id), newProduct.cost);

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
    window.scrollTo({ top: 0, behavior: "smooth" });

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
      cost: costs[String(product.id)] ? String(costs[String(product.id)]) : "",
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
      await saveCost(editingProduct.id, editForm.cost);

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

  const categoryOptions = Array.from(
    new Set(
      [
        ...adminCategories,
        ...products.map((p) => String(p.category || "").trim()),
        newProduct.category,
        editForm.category,
        "Vegetables",
      ].filter(Boolean)
    )
  );

  // Drag & drop priority: same order on the home page and the shop page
  async function saveOrder(next: Product[]) {
    setProducts(next);
    setOrderMsg("Saving order…");
    try {
      const r = await fetch("/api/admin/product-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      const j = await getResponseData(r);
      if (!r.ok || !j?.success) throw new Error(j?.error || "Could not save order");
      setOrderMsg("Order saved ✓");
    } catch (e) {
      setOrderMsg(e instanceof Error ? e.message : "Could not save order");
      void loadProducts();
    }
    window.setTimeout(() => setOrderMsg(""), 2500);
  }

  function dropOn(targetId: number) {
    const fromId = dragId;
    setDragId(null);
    setOverId(null);
    if (!fromId || fromId === targetId) return;
    const next = [...products];
    const from = next.findIndex((p) => p.id === fromId);
    if (from < 0) return;
    const [moved] = next.splice(from, 1);
    const to = next.findIndex((p) => p.id === targetId);
    // dropping on a card further down puts it after that card, otherwise before it
    const goingDown = products.findIndex((p) => p.id === fromId) < products.findIndex((p) => p.id === targetId);
    next.splice(goingDown ? to + 1 : to, 0, moved);
    void saveOrder(next);
  }

  return (
    <div className="min-h-screen bg-[#f4f7f7] p-3">
      <div className="max-w-[1600px] mx-auto space-y-3">

        {/* HEADER — one compact row */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="mr-auto">
            <h1 className="text-[15px] font-bold text-[#063f3d]">📦 Products</h1>
            <p className="text-[11px] text-slate-500">Add, edit, sort and manage products</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Total <b>{totalProducts}</b></span>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Active <b>{activeProducts}</b></span>
            <span className="rounded-full bg-yellow-50 px-2 py-1 text-yellow-700">Best <b>{bestSellers}</b></span>
            <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">Low stock <b>{lowStock}</b></span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setShowAdd((v) => !v)} className="rounded-lg bg-[#159447] px-2.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#117b3b]">
              {showAdd ? "✕ Close" : "+ Add product"}
            </button>
            <a href="/admin/bulk-products" className="rounded-lg border border-emerald-600 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700 hover:bg-emerald-50">
              ⬆ CSV / Bulk
            </a>
            <a href="/admin/product-images" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
              🖼 Make images{products.filter((p) => !p.image?.trim()).length ? ` (${products.filter((p) => !p.image?.trim()).length})` : ""}
            </a>
            <a href="/admin/categories" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
              Categories
            </a>
            <button onClick={loadProducts} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
              ↻
            </button>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-4 text-red-700 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* ADD PRODUCT (opens with "+ Add product") */}
        {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-3 py-2 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-[#063f3d]">Add new product</h2>
          </div>

          <div className="p-4">

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">

              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                placeholder="Product Name"
                className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              />

              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
                className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                list="pack-list-newProduct"
                value={newProduct.pack}
                onChange={(e) => setNewProduct({ ...newProduct, pack: e.target.value })}
                onBlur={(e) => setNewProduct({ ...newProduct, pack: cleanPackLabel(e.target.value) || "1kg" })}
                placeholder="Pack: 1kg / 100g / 400g / Bunch"
                title="Price is for this pack. 1kg products: customer chooses 250g, 500g... Any other pack (e.g. 100g, 400g) is sold only as that pack."
                className="w-28 border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              />
              <datalist id="pack-list-newProduct">
                {packChoices(newProduct.pack).map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>

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
                className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
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
                className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              />

              <label className="relative block" title="Purchase rate for the same pack. Only admin can see this.">
                <input
                  type="number"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                  placeholder="Purchase rate ₹"
                  className="w-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-amber-500"
                />
                <span className="pointer-events-none absolute -top-2 right-2 rounded bg-amber-500 px-1 text-[8px] font-extrabold uppercase text-white">Admin only</span>
              </label>

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
                className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              />

              <div className="md:col-span-2 xl:col-span-3 border border-slate-200 rounded-lg p-2.5 bg-gray-50 text-[13px]">
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
                className="md:col-span-2 xl:col-span-3 border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
              />

            </div>

            <div className="mt-3 grid md:grid-cols-3 gap-3">

              <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Customer Saving
                </p>

                <p className="text-2xl font-extrabold text-[#159447] mt-1">
                  ₹{newSaving}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  MRP - Our Price
                </p>
              </div>

              <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.bestSeller}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      bestSeller: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[#159447]"
                />
                <span className="font-semibold">
                  Add to Best Sellers
                </span>
              </label>

              <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.active}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[#159447]"
                />
                <span className="font-semibold">
                  Active Product
                </span>
              </label>

            </div>

            <div className="mt-3">
              <button
                onClick={addProduct}
                disabled={saving}
                className="bg-[#159447] hover:bg-[#117b3b] disabled:bg-gray-400 text-white px-4 py-2 text-[13px] rounded-lg font-bold transition"
              >
                {saving ? "Saving..." : "+ Add Product"}
              </button>
            </div>

          </div>
        </div>
        )}

        {/* EDIT PRODUCT */}
        {editingProduct && (
          <div className="bg-white border-2 border-[#159447] rounded-xl shadow-sm overflow-hidden">

            <div className="bg-[#063f3d] text-white px-4 py-5 flex items-center justify-between">
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

            <div className="p-4">

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Product Name"
                  className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                />

                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                    })
                  }
                  className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  list="pack-list-editForm"
                  value={editForm.pack}
                  onChange={(e) => setEditForm({ ...editForm, pack: e.target.value })}
                  onBlur={(e) => setEditForm({ ...editForm, pack: cleanPackLabel(e.target.value) || "1kg" })}
                  placeholder="Pack: 1kg / 100g / 400g / Bunch"
                  title="Price is for this pack. 1kg products: customer chooses 250g, 500g... Any other pack (e.g. 100g, 400g) is sold only as that pack."
                  className="w-28 border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                />
                <datalist id="pack-list-editForm">
                  {packChoices(editForm.pack).map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>

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
                  className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
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
                  className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                />

                <label className="relative block" title="Purchase rate for the same pack. Only admin can see this.">
                  <input
                    type="number"
                    value={editForm.cost}
                    onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                    placeholder="Purchase rate ₹"
                    className="w-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-amber-500"
                  />
                  <span className="pointer-events-none absolute -top-2 right-2 rounded bg-amber-500 px-1 text-[8px] font-extrabold uppercase text-white">Admin only</span>
                </label>

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
                  className="border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                />

                <div className="md:col-span-2 xl:col-span-3 border border-slate-200 rounded-lg p-2.5 bg-gray-50 text-[13px]">
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
                  className="md:col-span-2 xl:col-span-3 border border-slate-200 bg-gray-50 px-2.5 py-1.5 text-[13px] rounded-lg outline-none focus:border-[#159447]"
                />

              </div>

              <div className="mt-3 grid md:grid-cols-3 gap-3">

                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Product Saving
                  </p>

                  <p className="text-2xl font-extrabold text-[#159447] mt-1">
                    ₹{editSaving}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    MRP - Our Price
                  </p>
                </div>

                <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.bestSeller}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        bestSeller: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#159447]"
                  />
                  <span className="font-semibold">
                    Best Seller
                  </span>
                </label>

                <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#159447]"
                  />
                  <span className="font-semibold">
                    Active Product
                  </span>
                </label>

              </div>

              <button
                onClick={saveEdit}
                disabled={saving}
                className="mt-3 bg-[#159447] hover:bg-[#117b3b] disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-bold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-2">

          <div className="flex flex-col lg:flex-row gap-2">

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">
                🔍
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full border border-slate-200 bg-gray-50 rounded-lg pl-9 pr-3 py-1.5 text-[13px] outline-none focus:border-[#159447]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="lg:w-48 border border-slate-200 bg-gray-50 rounded-lg px-2 py-1.5 text-[13px] font-semibold outline-none focus:border-[#159447]"
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
              className="lg:w-36 border border-slate-200 bg-gray-50 rounded-lg px-2 py-1.5 text-[13px] font-semibold outline-none focus:border-[#159447]"
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

          <p className="text-[11px] text-gray-500 mt-1.5">
            Showing {filteredProducts.length} of{" "}
            {products.length} products
          </p>
        </div>

        {/* PRODUCT GRID */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">⠿ Drag a card and drop it on another to change the order on the home page and shop page</p>
            {orderMsg && <span className="text-[11px] font-semibold text-emerald-700">{orderMsg}</span>}
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
              <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 font-semibold text-gray-500">
                Loading Products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl mx-auto">
                📦
              </div>

              <h2 className="text-xl font-bold text-[#063f3d] mt-3">
                No Products Found
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">

              {filteredProducts.map((product, index) => {
                const mrp = Number(product.mrp || 0);
                const price = Number(product.price || 0);
                const productSaving = Math.max(mrp - price, 0);
                const off = mrp > price ? Math.round((productSaving / mrp) * 100) : 0;
                const stock = Number(product.stock || 0);

                return (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(product.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (overId !== product.id) setOverId(product.id);
                    }}
                    onDragLeave={() => overId === product.id && setOverId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      dropOn(product.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    className={`group flex cursor-grab flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-md active:cursor-grabbing ${
                      product.bestSeller ? "border-yellow-400" : "border-slate-200"
                    } ${product.active === false ? "opacity-60" : ""} ${dragId === product.id ? "scale-95 opacity-40" : ""} ${
                      overId === product.id && dragId !== product.id ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-green-50">
                      <img
                        src={product.image?.trim() ? product.image : "/placeholder-product.png"}
                        alt={product.name}
                        className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-[1.15]"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                      <span className="absolute left-1 top-1 rounded bg-white/90 px-1 text-[9px] font-bold text-slate-600 shadow-sm" title="Drag to reorder">⠿ #{index + 1}</span>
                      {product.bestSeller && (
                        <span className="absolute right-1 top-1 rounded bg-yellow-400 px-1 text-[9px] font-extrabold text-black">★ BEST</span>
                      )}
                      {product.active === false && (
                        <span className="absolute bottom-1 right-1 rounded bg-slate-700 px-1 text-[9px] font-bold text-white">OFF</span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-1.5">
                      <h3 className="truncate text-[12px] font-bold text-gray-800" title={product.name}>{product.name}</h3>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="shrink-0 rounded bg-slate-100 px-1 font-bold text-[#063f3d]">{product.pack}</span>
                        <span className="truncate text-gray-400">{product.category || "Product"}</span>
                        <span className={`ml-auto shrink-0 font-bold ${stock <= 5 ? "text-red-600" : "text-slate-500"}`}>Stock {stock}</span>
                      </div>
                      {costs[String(product.id)] > 0 && (
                        <div className="text-[10px] font-semibold text-amber-700" title="Admin only">
                          Cost ₹{costs[String(product.id)]} · Margin{" "}
                          <b className={price - costs[String(product.id)] >= 0 ? "text-emerald-700" : "text-rose-600"}>
                            ₹{Math.round(price - costs[String(product.id)])} ({price > 0 ? Math.round(((price - costs[String(product.id)]) / price) * 100) : 0}%)
                          </b>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-black text-slate-900">₹{price}</span>
                        {mrp > price && <span className="text-[14px] font-bold text-slate-400 line-through decoration-red-500 decoration-2">₹{mrp}</span>}
                        {off > 0 && (
                          <span className="ml-auto inline-flex h-[18px] min-w-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-1.5 text-center text-[10px] font-extrabold leading-none text-white shadow-sm shadow-orange-200">
                            {off}% OFF
                          </span>
                        )}
                      </div>
                      {productSaving > 0 && <div className="text-[10px] font-bold text-emerald-700">You save ₹{productSaving}</div>}
                      {(product as Product & { season?: string }).season && (
                        <div className="truncate text-[10px] text-slate-500" title={(product as Product & { season?: string }).season}>
                          🗓 {(product as Product & { season?: string }).season}
                        </div>
                      )}

                      <div className="mt-auto grid grid-cols-4 gap-1 pt-1">
                        <button
                          onClick={() => openEdit(product)}
                          title="Edit product"
                          className="flex h-7 items-center justify-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => toggleBestSeller(product)}
                          title={product.bestSeller ? "Remove from best sellers" : "Mark as best seller"}
                          className={`flex h-7 items-center justify-center gap-0.5 rounded-lg border text-[10px] font-bold transition ${
                            product.bestSeller ? "border-yellow-500 bg-yellow-400 text-slate-900" : "border-slate-200 bg-white text-slate-500 hover:border-yellow-400 hover:text-yellow-700"
                          }`}
                        >
                          ★ Best
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          title={product.active === false ? "Show to customers" : "Hide from customers"}
                          className={`flex h-7 items-center justify-center gap-1 rounded-lg border text-[10px] font-bold transition ${
                            product.active === false ? "border-slate-200 bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${product.active === false ? "bg-slate-400" : "bg-emerald-500"}`} />
                          {product.active === false ? "Off" : "Live"}
                        </button>
                        <button
                          onClick={() => deleteProduct(product)}
                          title="Delete product"
                          className="flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                        >
                          🗑
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









