import { redirect } from "next/navigation";

// /category/vegetables -> products page filtered by that category
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(decodeURIComponent(slug || ""))}`);
}
