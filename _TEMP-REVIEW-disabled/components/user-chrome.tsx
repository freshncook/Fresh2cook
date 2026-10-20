"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Gift, Truck, UserRound, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAdminPage = pathname.startsWith("/admin");

  const [cartCount, setCartCount] = useState(0);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    function readCartCount() {
      try {
        const raw = localStorage.getItem("freshcut-cart");
        const cart = raw ? JSON.parse(raw) : [];
        const count = Array.isArray(cart)
          ? cart.reduce(
              (total: number, item: { qty?: number }) =>
                total + Number(item?.qty || 0),
              0
            )
          : 0;

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    readCartCount();

    const handleStorage = () => readCartCount();
    const handleCartUpdated = () => readCartCount();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  function performSearch() {
    const value = searchText.trim();

    if (!value) {
      window.location.href = "/products";
      return;
    }

    window.location.href = `/products?search=${encodeURIComponent(value)}`;
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-[82px] max-w-[1500px] items-center gap-4 px-4 lg:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0"
            aria-label="Fresh2Cook Home"
          >
            <img
              src="/logo.png.png"
              alt="Fresh2Cook"
              className="h-12 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </Link>

          {/* Search */}
          <div className="hidden min-w-0 flex-1 md:block">
            <div className="relative mx-auto w-full max-w-[620px]">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search vegetables, fruits & more..."
                className="h-11 w-full rounded-full border border-slate-200 bg-white px-5 pr-12 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={performSearch}
                aria-label="Search products"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white"
              >
                ðŸ”
              </button>
            </div>
          </div>

          {/* Right actions */}
          <nav className="ml-auto flex shrink-0 items-center gap-5 lg:gap-7">
            <Link
              href="/offers"
              className="group flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-orange-500"
            >
              <Gift
                size={29}
                strokeWidth={2.2}
                className="text-orange-500 transition group-hover:scale-105"
              />
              <span className="hidden sm:inline">Offers</span>
            </Link>

            <Link
              href="/track-order"
              className="group flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-emerald-600"
            >
              <Truck
                size={29}
                strokeWidth={2.2}
                className="text-emerald-600 transition group-hover:scale-105"
              />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            <Link
              href="/login"
              className="group flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-slate-950"
            >
              <UserRound
                size={31}
                strokeWidth={2}
                className="text-slate-900 transition group-hover:scale-105"
              />
              <span className="hidden sm:inline">Login / Sign Up</span>
            </Link>

            <Link
              href="/cart"
              aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
              className="group relative flex h-11 w-11 items-center justify-center"
            >
              <ShoppingCart
                size={33}
                strokeWidth={2}
                className="text-emerald-700 transition group-hover:scale-105"
              />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="block border-t border-slate-100 bg-white px-4 py-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={performSearch}
              aria-label="Search products"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white"
            >
              ðŸ”
            </button>
          </div>
        </div>
      </header>

      <div className="h-[82px] print:hidden md:h-[82px]" />
      <div className="md:hidden h-[62px] print:hidden" />

      {children}

      <a
        href="https://wa.me/919811001901"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 print:hidden"
      >
        <FaWhatsapp size={31} />
      </a>
    </>
  );
}




