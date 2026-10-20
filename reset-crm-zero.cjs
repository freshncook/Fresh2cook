const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const clearModels = [
  "lead", "task", "order", "orderItem", "walletTransaction",
  "referral", "membership", "cart", "notification", "coupon",
  "customerAddress", "vendorOrder", "purchaseOrder",
  "dailySale", "customerFeedback", "supportTicket", "loyaltyTier",
  "customerSegment", "campaign", "campaignLog", "automationRule",
  "marketingInsight", "campaignTrigger", "customerJourney",
  "revenueForecast", "customerPrediction", "churnRisk", "invoice",
  "riderWalletTransaction", "riderLocationHistory", "riderAttendance",
  "riderPayout", "riderIncentive", "riderPenalty", "deliveryRoute",
  "wishlist", "walletLedger"
];

async function main() {
  console.log("Starting CRM reset...");
  await prisma.$transaction(async (tx) => {
    for (const model of clearModels) {
      if (!tx[model]) throw new Error(`Prisma model not found: ${model}`);
      const result = await tx[model].deleteMany();
      console.log(`${model}: ${result.count} deleted`);
    }

    const riders = await tx.deliveryBoy.updateMany({
      data: {
        completedDeliveries: 0,
        earnings: 0,
        rating: 5,
        latitude: null,
        longitude: null,
        speed: null,
        lastSeen: null,
        status: "Offline"
      }
    });
    console.log(`Rider profiles reset: ${riders.count}`);
  });

  console.log("\nRESET COMPLETE. Products and stock were not changed.");
  console.log("Expenses, inventory movements and supplier/vendor payment history were preserved.");
}

main()
  .catch((e) => {
    console.error("\nRESET FAILED. Transaction should have rolled back.");
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

