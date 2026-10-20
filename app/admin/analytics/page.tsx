import { redirect } from "next/navigation";

// Live analytics are on the admin dashboard
export default function Page() {
  redirect("/admin");
}
