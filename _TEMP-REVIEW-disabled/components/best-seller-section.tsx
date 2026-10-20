async function getProducts() {
  const res = await fetch(
    "http://localhost:3000/api/products",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function BestSellerSection() {
  const products = await getProducts();

  const bestSellers = products.filter(
    (p: any) => p.bestSeller === true
  );

  return (
    <section className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4">
        Best Sellers
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bestSellers.map((p: any) => (
          <div
            key={p.id}
            className="bg-white border rounded-xl p-3"
          >
            <img
              src={
                p.image?.trim()
                  ? p.image
                  : "/placeholder-product.png"
              }
              alt={p.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />

            <h3 className="font-semibold text-sm">
              {p.name}
            </h3>

            <p className="text-xs text-gray-500">
              {p.pack}
            </p>

            <p className="text-green-600 font-bold mt-1">
              â‚¹{p.price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}



