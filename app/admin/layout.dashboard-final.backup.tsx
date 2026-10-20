"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Megaphone,
  Wallet,
  BarChart3,
  Brain,
  Settings,
  Bell,
  Menu,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, text: "Dashboard" },
    { href: "/admin/products", icon: Package, text: "Products" },
    { href: "/admin/orders", icon: ShoppingCart, text: "Orders" },
    { href: "/admin/customers", icon: Users, text: "Customers" },
    { href: "/admin/delivery", icon: Truck, text: "Delivery" },
    { href: "/admin/marketing", icon: Megaphone, text: "Marketing" },
    { href: "/admin/finance", icon: Wallet, text: "Finance" },
    { href: "/admin/analytics", icon: BarChart3, text: "Analytics" },
    { href: "/admin/ai-center", icon: Brain, text: "AI Center" },
    { href: "/admin/settings", icon: Settings, text: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f9]">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">

        <div className="h-16 px-5 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button className="p-2 rounded-lg hover:bg-slate-100">
              <Menu size={20} />
            </button>

            <Link href="/admin" className="flex items-center">

              <img
                src="/logo.png"
                alt="Fresh2Cook"
                className="h-10 w-auto"
              />

            </Link>

          </div>

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <ExternalLink size={16} />
              View Website
            </Link>

            <button className="relative p-2 rounded-lg hover:bg-slate-100">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                R
              </div>

              <div className="hidden md:block">
                <div className="font-semibold text-sm">
                  Ramakant Rao
                </div>
                <div className="text-xs text-slate-500">
                  Administrator
                </div>
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* NAVBAR */}

      <div className="bg-white border-b border-slate-200">

        <div className="h-14 px-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <Icon size={16} />
                <span>{item.text}</span>
              </Link>
            );
          })}

        </div>

      </div>

      {/* PAGE */}

      <main className="p-5">
        {children}
      </main>

    </div>
  );
}

