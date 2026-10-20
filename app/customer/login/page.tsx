import { redirect } from "next/navigation";

// Moved to the new customer account page
export default function Page() {
  redirect("/login");
}
