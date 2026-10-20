const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const rows = await p.deliveryAssignment.findMany({
    select: {
      id: true,
      orderId: true,
      deliveryBoyId: true,
      status: true,
      assignedAt: true,
      acceptedAt: true,
      deliveredAt: true,
      earnings: true
    },
    orderBy: { id: "asc" }
  });

  console.log("Remaining Delivery Assignments:", rows.length);
  console.table(rows);
}

main()
  .catch(e => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(async () => await p.$disconnect());
