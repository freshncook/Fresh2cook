import RiderPortal from "@/components/rider/rider-portal";

// Fresh2Cook rider app - live data from /api/rider-portal
export const dynamic = "force-dynamic";

export default function RiderTasksPage() {
  return <RiderPortal loginPath="/rider/login" />;
}