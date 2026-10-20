const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const before = await p.deliveryAssignment.count();
  console.log("Assignments before cleanup:", before);

  if (before === 0) {
    console.log("Already clean. No changes needed.");
    return;
  }

  const answer = process.env.CONFIRM_ASSIGNMENT_RESET;
  if (answer !== "YES") {
    throw new Error("Safety check failed. Run with confirmation in PowerShell.");
  }

  const result = await p.deliveryAssignment.deleteMany({});
  const after = await p.deliveryAssignment.count();

  console.log("Assignments deleted:", result.count);
  console.log("Assignments remaining:", after);

  if (after !== 0) throw new Error("Cleanup verification failed.");
  console.log("SUCCESS: DeliveryAssignment is now empty.");
}

main()
  .catch(e => {
    console.error("CLEANUP STOPPED:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => await p.$disconnect());
