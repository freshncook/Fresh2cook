"use client";

import { useEffect, useState } from "react";
import { packOptions, priceForPack, shopDefaultPack } from "@/lib/pack-price";
import { thumb } from "@/lib/img-url";
// User side shows the 250 g pack by default
import { useStoreSettings } from "@/lib/use-store-settings";

type Product = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  image?: string;
  category?: string;
  pack?: string;
  mrp?: number;
  active?: boolean;
};

type Cat = { name: string; count: number; image: string | null };

const SORTS = [
  { key: "popular", label: "Popular" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
  { key: "off", label: "Biggest discount" },
] as const;

type CartItem = Product & {
  qty: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedPack, setSelectedPack] = useState<Record<number,string>>({});
  const [cats, setCats] = useState<Cat[]>([]);
  const shop = useStoreSettings(); // pack size extras (Admin > Settings)
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("popular");
  const [onlyOffer, setOnlyOffer] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const searchParam =
      params.get("search") || "";

    setSearch(searchParam);
    setCategory(params.get("category") || "");

    loadProducts();
    loadCartCount();
    // Categories with images, in the order set by admin (Admin > Categories)
    fetch("/api/home-data", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setCats(Array.isArray(j?.categories) ? j.categories : []))
      .catch(() => setCats([]));

    const handleCartUpdated = () => {
      loadCartCount();
      syncQtyFromCart();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdated
    );

    window.addEventListener(
      "storage",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );

      window.removeEventListener(
        "storage",
        handleCartUpdated
      );
    };
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/products",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load products"
        );
      }

      const data =
        await response.json();

      const list: Product[] =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data.products
            )
          ? data.products
          : Array.isArray(data.data)
          ? data.data
          : [];

      // customers only see active products
      setProducts(list.filter((p) => p.active !== false));

      const savedCart =
        getCart();

      const startingQty: Record<
        number,
        number
      > = {};

      list.forEach((product) => {
        const existing =
          savedCart.find(
            (item) =>
              Number(item.id) ===
              Number(product.id)
          );

        startingQty[product.id] =
          existing
            ? Number(
                existing.qty || 1
              )
            : 1;
      });

      setQty(startingQty);
    } catch (error) {
      console.error(
        "Products load error:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function getCart(): CartItem[] {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "freshcut-cart"
        ) || "[]"
      );

      return Array.isArray(saved)
        ? saved
        : [];
    } catch {
      return [];
    }
  }

  function saveCart(
  cart: CartItem[]
) {

  console.log(
    "CART SIZE = ",
    JSON.stringify(cart).length
  );
console.log(
  "Cart Size:",
  JSON.stringify(cart).length
);
  localStorage.setItem(
    "freshcut-cart",
    JSON.stringify(cart)
  );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }

  function loadCartCount() {
    const cart =
      getCart();

    setCartCount(
      cart.length
    );
  }

  function syncQtyFromCart() {
    const cart =
      getCart();

    setQty((prev) => {
      const next = {
        ...prev,
      };

      products.forEach(
        (product) => {
          const existing =
            cart.find(
              (item) =>
                Number(item.id) ===
                Number(product.id)
            );

          next[product.id] =
            existing
              ? Number(
                  existing.qty || 1
                )
              : Math.max(
                  Number(
                    next[
                      product.id
                    ] || 1
                  ),
                  1
                );
        }
      );

      return next;
    });
  }

  function increase(
    product: Product
  ) {
    const current = Number(
      qty[product.id] || 1
    );

    const stock = Number(
      product.stock || 0
    );

    if (
      stock <= 0 ||
      current >= stock
    ) {
      return;
    }

    setQty((prev) => ({
      ...prev,
      [product.id]:
        current + 1,
    }));
  }

  function decrease(
    productId: number
  ) {
    const current = Number(
      qty[productId] || 1
    );

    setQty((prev) => ({
      ...prev,
      [productId]:
        Math.max(
          current - 1,
          1
        ),
    }));
  }

  function addToCart(
    product: Product
  ) {
    try {
      const stock = Number(
        product.stock || 0
      );

      if (stock <= 0) {
        return;
      }

      const cart =
        getCart();

      const selectedQty =
        Math.max(
          1,
          Math.min(
            Number(
              qty[product.id] || 1
            ),
            stock
          )
        );

      const currentPack =
  selectedPack[product.id] ||
  shopDefaultPack(product.pack, shop);
      const packed = priceForPack(product, currentPack, shop);

const existingIndex =
  cart.findIndex(
    (item) =>
      Number(item.id) === Number(product.id) &&
      item.pack === currentPack
  );

if (
  existingIndex >= 0
) {
  const existingQty =
    Number(
      cart[
        existingIndex
      ].qty || 1
    );

  cart[
    existingIndex
  ] = {
    ...cart[
      existingIndex
    ],
    name: product.name,
    category:
      product.category,
    price: packed.price,
    mrp: packed.mrp || packed.price,
    stock: product.stock,
    image: product.image && !String(product.image).startsWith("data:") ? product.image : "",
    pack:
      currentPack,
    qty: Math.min(
      existingQty +
        selectedQty,
      stock
    ),
  };
} else {
  cart.push({
    id: product.id,
    name: product.name,
    category:
      product.category,
    price: packed.price,
    mrp: packed.mrp || packed.price,
    stock: product.stock,
    image: product.image && !String(product.image).startsWith("data:") ? product.image : "",
    pack:
      currentPack,
    qty: selectedQty,
  });
}
console.log(
  "Cart Size:",
  JSON.stringify(cart).length
);
      saveCart(cart);

      setQty((prev) => ({
        ...prev,
        [product.id]: 1,
      }));
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );
    }
  }

  // Categories: admin order (with images) first, then any other product category
  const productCats = Array.from(new Set(products.map((p) => String(p.category || "").trim()).filter(Boolean)));
  const categoryList: Cat[] = [
    ...cats.filter((c) => c.count > 0 || productCats.some((n) => n.toLowerCase() === c.name.toLowerCase())),
    ...productCats
      .filter((n) => !cats.some((c) => c.name.toLowerCase() === n.toLowerCase()))
      .map((n) => ({ name: n, count: products.filter((p) => p.category === n).length, image: products.find((p) => p.category === n && p.image)?.image || null })),
  ];

  const discountOf = (p: Product) => (Number(p.mrp || 0) > p.price ? (Number(p.mrp) - p.price) / Number(p.mrp) : 0);
  const keyword = search.toLowerCase().trim();
  const filteredProducts = products
    .filter(
      (product) =>
        (!keyword || product.name.toLowerCase().includes(keyword) || String(product.category || "").toLowerCase().includes(keyword)) &&
        (!category ||
          String(product.category || "").toLowerCase() === category.toLowerCase() ||
          String(product.category || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .includes(category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) &&
        (!onlyOffer || discountOf(product) > 0) &&
        (!inStockOnly || Number(product.stock || 0) > 0)
    )
    .sort((a, b) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "off" ? discountOf(b) - discountOf(a) : 0
    );

  function updateUrl(nextSearch: string, nextCategory: string) {
    const url = new URL(window.location.href);
    if (nextSearch) url.searchParams.set("search", nextSearch);
    else url.searchParams.delete("search");
    if (nextCategory) url.searchParams.set("category", nextCategory);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url.toString());
  }

  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${
      on ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-[1400px] px-2 pb-28 pt-2 sm:px-4 lg:px-6">
        {/* Top bar: title, search, sort, quick filters */}
        <div className="sticky top-[144px] z-20 -mx-2 mb-2 border-b border-slate-200 bg-gray-50/95 px-2 py-2 backdrop-blur sm:-mx-4 sm:px-4 md:top-[82px] lg:-mx-6 lg:px-6">
          <div className="flex items-center gap-2">
            <h1 className="hidden shrink-0 text-[17px] font-black text-slate-900 sm:block">
              {category || "All products"}
              <span className="ml-1 text-[12px] font-medium text-slate-500">({filteredProducts.length})</span>
            </h1>
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">🔍</span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl(e.target.value, category);
                }}
                placeholder="Search vegetables, fruits…"
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort products"
              className="w-[110px] shrink-0 rounded-xl border border-slate-300 bg-white px-2 py-2 text-[12px] font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none sm:ml-auto sm:w-auto"
            >
              {SORTS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            <button onClick={() => setOnlyOffer((v) => !v)} className={chip(onlyOffer)}>
              🏷️ On offer
            </button>
            <button onClick={() => setInStockOnly((v) => !v)} className={chip(inStockOnly)}>
              ✅ In stock
            </button>
            {(onlyOffer || inStockOnly || search || category) && (
              <button
                onClick={() => {
                  setOnlyOffer(false);
                  setInStockOnly(false);
                  setSearch("");
                  setCategory("");
                  updateUrl("", "");
                }}
                className="shrink-0 px-2 text-[12px] font-semibold text-rose-600"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          {/* Category rail (left) — Blinkit style on mobile, list on desktop */}
          <aside className="sticky top-[250px] h-[calc(100vh-260px)] w-[68px] shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white md:top-[190px] md:h-[calc(100vh-200px)] md:w-[190px]">
            {[{ name: "", count: products.length, image: null as string | null }, ...categoryList].map((c) => {
              const on = (category || "").toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name || "all"}
                  onClick={() => {
                    setCategory(c.name);
                    updateUrl(search, c.name);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`relative flex w-full flex-col items-center gap-1 border-b border-slate-100 px-1 py-2 text-center transition md:flex-row md:gap-2 md:px-2 md:text-left ${
                    on ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  {on && <span className="absolute right-0 top-1 bottom-1 w-1 rounded-l bg-emerald-600 md:left-0 md:right-auto md:rounded-l-none md:rounded-r" />}
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ${on ? "bg-white ring-2 ring-emerald-500" : "bg-emerald-50/70"}`}>
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb(c.image, 120)} alt="" loading="lazy" className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <span className="text-lg">{c.name ? "🥬" : "🛒"}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={`line-clamp-2 block text-[10px] leading-tight md:text-[12px] ${on ? "font-extrabold text-emerald-800" : "font-semibold text-slate-700"}`}>
                      {c.name || "All"}
                    </span>
                    <span className="hidden text-[10px] text-slate-400 md:block">{c.count} items</span>
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="min-w-0 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[210px] animate-pulse rounded-xl bg-slate-200/70" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-3xl">🥕</p>
            <p className="mt-1 text-[15px] font-bold text-slate-800">No products found</p>
            <p className="mt-1 text-[12px] text-slate-500">{search ? `Nothing matched "${search}". ` : ""}Try another category or clear the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map(
              (product) => {
                const stock =
                  Number(
                    product.stock || 0
                  );

                const selectedQty =
                  Number(
                    qty[
                      product.id
                    ] || 1
                  );

                const isOutOfStock =
                  stock <= 0;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                  >
                    {(() => {
                      const pk = selectedPack[product.id] || shopDefaultPack(product.pack, shop);
                      const { price, mrp } = priceForPack(product, pk, shop);
                      const saving = mrp ? mrp - price : 0;
                      const off = mrp ? Math.round((saving / mrp) * 100) : 0;
                      return (
                        <>
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white">
                            <img
                              src={thumb(product.image, 400) || "/placeholder-product.png"}
                              loading="lazy"
                              decoding="async"
                              alt={product.name}
                              className="h-full w-full object-contain p-1 transition duration-300 ease-out group-hover:scale-[1.18]"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-product.png";
                              }}
                            />
                            {!isOutOfStock && stock <= 5 && (
                              <span className="absolute right-1 top-1 rounded bg-white/90 px-1 text-[9px] font-bold text-amber-700 shadow-sm">Only {stock} left</span>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1.5 pt-1 sm:px-2 sm:pb-2">
                            <h2 className="line-clamp-1 text-[12px] font-extrabold leading-tight text-slate-900 sm:text-[13px]" title={product.name}>
                              {product.name}
                            </h2>
                            <div className="flex items-center gap-1">
                              <select
                                aria-label={`Pack size for ${product.name}`}
                                className="min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-bold text-slate-700"
                                value={pk}
                                onChange={(e) => setSelectedPack({ ...selectedPack, [product.id]: e.target.value })}
                              >
                                {packOptions(product.pack, shop).map((o) => (
                                  <option key={o}>{o}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-1">
                              <span className="text-[15px] font-black tabular-nums text-slate-900 sm:text-[16px]">₹{price}</span>
                              {mrp > 0 && <span className="text-[15px] font-bold tabular-nums text-slate-400 line-through decoration-red-500 decoration-2 sm:text-[16px]">₹{mrp}</span>}
                              {off > 0 && (
                                <span className="ml-auto inline-flex h-[18px] min-w-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-1.5 text-center text-[10px] font-extrabold leading-none text-white shadow-sm shadow-orange-200">
                                  {off}% OFF
                                </span>
                              )}
                            </div>
                            {saving > 0 && <div className="text-[10px] font-bold text-emerald-700">You save ₹{saving}</div>}

                            <div className="mt-auto flex items-center gap-1 pt-0.5">
                              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => decrease(product.id)}
                                  disabled={isOutOfStock || selectedQty <= 1}
                                  className="h-7 w-6 text-[14px] font-bold disabled:opacity-30"
                                  aria-label="Less"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center text-[12px] font-bold">{selectedQty}</span>
                                <button
                                  type="button"
                                  onClick={() => increase(product)}
                                  disabled={isOutOfStock || selectedQty >= stock}
                                  className="h-7 w-6 text-[14px] font-bold disabled:opacity-30"
                                  aria-label="More"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                disabled={isOutOfStock}
                                className="h-7 flex-1 rounded-lg border border-emerald-600 bg-emerald-50 text-[12px] font-extrabold text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                {isOutOfStock ? "SOLD OUT" : "ADD"}
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </article>
                );
              }
            )}
          </div>
        )}
          </section>
        </div>
      </main>

      {cartCount > 0 && (
        <a
          href="/cart"
          className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl bg-emerald-600 px-4 py-2.5 text-white shadow-2xl shadow-emerald-900/30 transition hover:bg-emerald-700 md:left-auto md:right-24 md:translate-x-0"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[13px] font-extrabold">
            {cartCount} item{cartCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[12px] font-bold">View cart →</span>
        </a>
      )}
    </div>
  );
}



