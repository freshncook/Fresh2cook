export default function CategoriesPage() {
  const categories = [
    "Leafy Vegetables",
    "Root Vegetables",
    "Ready To Cook",
    "Salad Pack",
    "Exotic Veggies",
    "Cooking Combo",
    "Best Seller",
    "Deals",
  ];

  return (
    <div className="p-4">

      <h1 className="text-3xl font-bold mb-6">
        Categories
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {categories.map((c) => (
          <div
            key={c}
            className="border rounded-xl p-6 text-center bg-white"
          >
            {c}
          </div>
        ))}

      </div>

    </div>
  );
}






