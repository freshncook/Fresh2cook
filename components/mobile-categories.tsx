export default function MobileCategories() {
  const categories = [
    "Vegetables",
    "Fruits",
    "Salad",
    "Ready To Cook",
    "Combo Packs",
    "Seasonal",
  ];

  return (
    <section className="px-4 py-4">
      <h2 className="text-2xl font-bold mb-4">
        Categories
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((c) => (
          <div
            key={c}
            className="bg-white border rounded-2xl p-4 text-center font-medium"
          >
            {c}
          </div>
        ))}
      </div>
    </section>
  );
}






