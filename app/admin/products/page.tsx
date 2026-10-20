import { redirect } from "next/navigation";

// Products are managed on /admin/products-manage
export default function Page() {
  redirect("/admin/products-manage");
}
