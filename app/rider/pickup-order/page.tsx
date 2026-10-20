import RiderPickup from "@/components/rider/rider-pickup";

// Fresh2Cook rider pickup - dropdown of orders ready for pickup
export const dynamic = "force-dynamic";

export default function RiderPickupPage() {
  return <RiderPickup loginPath="/rider/login" tasksPath="/rider/my-tasks" />;
}