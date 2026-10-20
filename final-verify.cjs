const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const [products, orders, items, assignments, riders] = await Promise.all([
    p.product.count(),
    p.order.count(),
    p.orderItem.count(),
    p.deliveryAssignment.count(),
    p.deliveryBoy.findMany({
      select: { name: true, status: true, completedDeliveries: true, earnings: true }
    })
  ]);

  console.table([
    { table: "Product", count: products },
    { table: "Order", count: orders },
    { table: "OrderItem", count: items },
    { table: "DeliveryAssignment", count: assignments },
    { table: "DeliveryBoy", count: riders.length }
  ]);
  console.log("Rider verification:");
  console.table(riders);

  if (products !== 6 || orders !== 0 || items !== 0 || assignments !== 0) {
    throw new Error("Verification failed. Do not create a test sale yet.");
  }

  console.log("FINAL VERIFICATION PASSED");
}

main()
  .catch(e => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(async () => await p.$disconnect());
