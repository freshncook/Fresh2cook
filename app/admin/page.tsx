import AdminLiveDashboard from "@/components/admin/live-dashboard";

// Fresh2Cook admin dashboard - live data from /api/admin/dashboard-live
export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <AdminLiveDashboard
      links={{
        orders: "/admin/orders",
        processing: "/processing/dashboard",
        delivery: "/admin/delivery-control",
        riders: "/admin/rider-approvals",
        inventory: "/admin/inventory",
        customers: "/admin/customers",
      }}
    />
  );
}