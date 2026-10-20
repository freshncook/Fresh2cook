import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.order.deleteMany();
  await prisma.task.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: "French Beans", category: "Beans", pack: "500g", price: 119, stock: 100 },
      { name: "Drumstick", category: "Beans", pack: "500g", price: 119, stock: 100 },
      { name: "Cluster Beans", category: "Beans", pack: "500g", price: 119, stock: 100 },
      { name: "Bottle Gourd", category: "Gourd", pack: "500g", price: 109, stock: 100 },
      { name: "Pumpkin", category: "Gourd", pack: "500g", price: 89, stock: 100 },
      { name: "Carrot", category: "Root", pack: "500g", price: 99, stock: 100 },
      { name: "Potato", category: "Root", pack: "1kg", price: 49, stock: 100 },
      { name: "Onion", category: "Daily Use", pack: "1kg", price: 50, stock: 100 },
      { name: "Tomato", category: "Daily Use", pack: "1kg", price: 45, stock: 100 },
      { name: "Button Mushroom", category: "Mushroom", pack: "200g", price: 75, stock: 100 }
    ]
  });

  await prisma.lead.createMany({
    data: [
      {
        name: "Priya Sharma",
        phone: "9876543210",
        area: "Rajouri Garden",
        source: "Facebook",
        interest: "Weekly Veg Box",
        status: "New",
        value: 699,
        nextFollowUp: "Today",
        avatar: "PS"
      },
      {
        name: "Amit Kumar",
        phone: "9876543211",
        area: "Janakpuri",
        source: "WhatsApp",
        interest: "Monthly Subscription",
        status: "Contacted",
        value: 1499,
        nextFollowUp: "Tomorrow",
        avatar: "AK"
      }
    ]
  });

  await prisma.order.createMany({
    data: [
      {
        customer: "Priya Sharma",
        amount: 699,
        status: "Pending"
      },
      {
        customer: "Amit Kumar",
        amount: 1499,
        status: "Delivered"
      }
    ]
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Call Priya",
        customer: "Priya Sharma",
        due: "Today",
        type: "Call",
        done: false
      },
      {
        title: "WhatsApp Amit",
        customer: "Amit Kumar",
        due: "Tomorrow",
        type: "WhatsApp",
        done: false
      }
    ]
  });

  console.log("FRESHCUT CRM PRO V2 SEEDED");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });




