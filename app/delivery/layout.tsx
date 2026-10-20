"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/delivery/login") {
    return <>{children}</>;
  }

  function logout() {
    localStorage.removeItem(
      "delivery-session"
    );

    window.location.href =
      "/delivery/login";
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="flex">

        <aside className="w-72 bg-white border-r shadow-sm min-h-screen">

          <div className="p-6 border-b">

            <h1 className="text-2xl font-bold text-green-600">
              FreshCut
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Delivery Partner Panel
            </p>

          </div>

          <nav className="p-4 space-y-2">

            <Link
              href="/delivery/dashboard"
              className="block px-4 py-3 rounded-xl hover:bg-green-50 font-medium"
            >
              🏠 Dashboard
            </Link>

            <Link
              href="/delivery/location-tracker"
              className="block px-4 py-3 rounded-xl hover:bg-green-50 font-medium"
            >
              📍 Live Tracking
            </Link>

            <Link
              href="/delivery/profile"
              className="block px-4 py-3 rounded-xl hover:bg-green-50 font-medium"
            >
              👤 My Profile
            </Link>

            <Link
              href="/delivery/wallet"
              className="block px-4 py-3 rounded-xl hover:bg-green-50 font-medium"
            >
              💰 My Wallet
            </Link>

            <button
              onClick={logout}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
            >
              Logout
            </button>

          </nav>

        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  );
}




