import { redirect } from "next/navigation";

// Refer & Earn lives in the customer account
export default function Page() {
  redirect("/account?tab=refer");
}
