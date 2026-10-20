"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string>("Products");

  const menuGroups = [
    {
      title: "Products",
      icon: "?",
      items: [
        ["Products", "/admin/products-manage"],
        ["Inventory", "/admin/inventory"],
        ["Categories", "/admin/categories"],
        ["Warehouse", "/warehouse"],
        ["Vendors", "/admin/vendors"],
      ],
    },
    {
      title: "Orders",
      icon: "??",
      items: [
        ["Orders", "/admin/orders"],
        ["Coupons", "/admin/coupons"],
        ["Subscription Boxes", "/admin/subscription-boxes"],
        ["Subscriptions", "/admin/subscriptions"],
      ],
    },
    {
      title: "Customers",
      icon: "?",
      items: [
        ["Customers", "/admin/customers"],
        ["Reviews", "/admin/reviews"],
        ["Feedback", "/admin/feedback"],
        ["Loyalty", "/admin/loyalty"],
      ],
    },
    {
      title: "Delivery",
      icon: "??",
      items: [
        ["Delivery", "/admin/delivery"],
        ["Delivery Boys", "/admin/delivery-boys"],
        ["Rider Approvals", "/admin/rider-approvals"],
        ["Rider Documents", "/admin/rider-documents"],
        ["Order Assignments", "/admin/order-assignments"],
        ["Delivery Tracking", "/admin/delivery-tracking"],
        ["Delivery Zones", "/admin/delivery-zones"],
      ],
    },
    {
      title: "Marketing",
      icon: "?",
      items: [
        ["Marketing", "/admin/marketing"],
        ["Notifications", "/admin/notifications"],
        ["WhatsApp Campaign", "/admin/whatsapp-campaign"],
        ["WhatsApp Automation", "/admin/whatsapp-automation"],
      ],
    },
    {
      title: "Finance",
      icon: "?",
      items: [
        ["Accounts", "/admin/accounts"],
        ["Expenses", "/admin/expenses"],
        ["Profit & Loss", "/admin/profit-loss"],
        ["Payroll", "/admin/payroll"],
        ["Attendance", "/admin/attendance"],
      ],
    },
    {
      title: "Analytics",
      icon: "?",
      items: [
        ["Reports", "/admin/reports"],
        ["Sales Analytics", "/admin/sales-analytics"],
        ["Business Intelligence", "/admin/business-intelligence"],
      ],
    },
    {
      title: "AI Center",
      icon: "?",
      items: [
        ["AI Dashboard", "/admin/ai-dashboard"],
        ["AI Call Center", "/admin/ai-call-center"],
        ["AI Nutrition", "/admin/ai-nutrition"],
        ["AI Demand Forecast", "/admin/ai-demand-forecast"],
        ["CEO Command Center", "/admin/ceo-command-center"],
      ],
    },
    {
      title: "Settings",
      icon: "?",
      items: [
        ["Settings", "/admin/settings"],
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-800">

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 h-[68px] bg-white border-b border-slate-200 shadow-sm">

        <div className="h-full flex items-center justify-between px-4 lg:px-6 gap-4">

          <div className="flex items-center justify-between w-full">

<div className="flex items-center gap-3">
<img src="/fresh2cook-logo.png" className="h-10 w-auto" alt="Fresh2Cook" />

<div>
<div className="font-bold text-slate-800">Fresh2Cook</div>
<div className="text-xs text-slate-500">Business Management</div>
</div>
</div>

<div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl bg-[#063f3d] text-white flex items-center justify-center text-xl hover:bg-[#075b56] transition shadow-sm"
            >
              ?
            </button>

            

            <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition">Dashboard</Link>

            <Link href="/" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#063f3d] text-white text-sm font-semibold hover:bg-[#075b56] transition">View Website</Link>

            <button className="relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-xl">
              ??
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200">

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#063f3d] to-[#159447] text-white flex items-center justify-center font-bold">
                R
              </div>

              <div className="hidden lg:block">
                <div className="text-sm font-bold text-slate-800">
                  Ramakant Rao
                </div>
                <div className="text-[11px] text-slate-400">
                  Administrator
                </div>
              </div>

            </div>

          </div>

</div>
</header>

<div className="flex">

        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside className="fixed lg:sticky top-[68px] left-0 z-40 w-[270px] h-[calc(100vh-68px)] bg-[#063f3d] text-white overflow-y-auto shadow-xl">

            {/* Main navigation */}
            <nav className="p-3 space-y-2">

              

              {menuGroups.map((group) => {

                const isOpen = openMenu === group.title;

                const groupActive = group.items.some(
                  ([, href]) =>
                    pathname === href ||
                    pathname.startsWith(`${href}/`)
                );

                return (
                  <div
                    key={group.title}
                    className="rounded-xl overflow-hidden"
                  >

                    <button
                      onClick={() =>
                        setOpenMenu(
                          isOpen ? "" : group.title
                        )
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition ${
                        groupActive
                          ? "bg-white/10 text-white"
                          : "text-emerald-50 hover:bg-white/10"
                      }`}
                    >

                      <span className="flex items-center gap-3">

                        <span className="w-6 text-center text-base">
                          {group.icon}
                        </span>

                        {group.title}

                      </span>

                      <span className="text-emerald-200 text-lg">
                        {isOpen ? "-" : "+"}
                      </span>

                    </button>

                    {isOpen && (
                      <div className="ml-4 mr-1 mt-1 mb-2 border-l border-white/10 pl-2 space-y-1">

                        {group.items.map(([name, href]) => {

                          const active =
                            pathname === href ||
                            pathname.startsWith(`${href}/`);

                          return (
                            <Link
                              key={href}
                              href={href}
                              className={`block px-3 py-2.5 rounded-lg text-[13px] transition ${
                                active
                                  ? "bg-[#13a64b] text-white font-semibold shadow-sm"
                                  : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {name}
                            </Link>
                          );
                        })}

                      </div>
                    )}

                  </div>
                );
              })}

            </nav>

            </aside>
        )}

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 min-w-0 transition-all duration-200 ${
            sidebarOpen ? "lg:ml-0" : ""
          }`}
        >

          {/* Page top strip */}
          <div className="px-4 lg:px-7 pt-5">

            <div className="max-w-[1800px] mx-auto">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[1.5px] text-[#159447]">
                    
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  System Online
                </div>

              </div>

              {/* Existing page */}
              <div className="admin-corporate-surface">
                {children}
              </div>

            </div>

          </div>

        </main>

      </div>

      {/* GLOBAL ADMIN VISUAL THEME */}
      <style jsx global>{`
        html,
        body {
          background: #f4f7f5;
        }

        body {
          color: #1e293b;
        }

        .admin-corporate-surface {
          min-height: calc(100vh - 130px);
        }

        .admin-corporate-surface > div {
          border-color: #e2e8f0;
        }

        .admin-corporate-surface button,
        .admin-corporate-surface a {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background-color 0.15s ease,
            border-color 0.15s ease;
        }

        .admin-corporate-surface button:hover,
        .admin-corporate-surface a:hover {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background-color 0.15s ease,
            border-color 0.15s ease;
        }

        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-track {
          background: #eef3f0;
        }

        ::-webkit-scrollbar-thumb {
          background: #b7c9c1;
          border-radius: 20px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #159447;
        }
      `}</style>

    </div>
  );
}
















