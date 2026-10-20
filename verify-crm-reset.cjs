const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const [products, orders, items, assignments, riders] = await Promise.all([
    p.product.findMany({
      select: { id: true, name: true, stock: true, price: true, active: true },
      orderBy: { name: "asc" }
    }),
    p.order.count(),
    p.orderItem.count(),
    p.deliveryAssignment.count(),
    p.deliveryBoy.findMany({
      select: {
        id: true, name: true, mobile: true, status: true,
        completedDeliveries: true, earnings: true, approvalStatus: true,
        latitude: true, longitude: true
      },
      orderBy: { name: "asc" }
    })
  ]);

  console.log("\n========== PRODUCTS & STOCK ==========");
  console.table(products);
  console.log("Product count:", products.length);

  console.log("\n========== ORDER COUNTS ==========");
  console.table([
    { table: "Order", count: orders },
    { table: "OrderItem", count: items },
    { table: "DeliveryAssignment", count: assignments }
  ]);

  console.log("\n========== RIDER STATUS & EARNINGS ==========");
  console.table(riders);
  console.log("Rider count:", riders.length);
}

main()
  .catch(e => {
    console.error("VERIFY FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => await p.$disconnect());
