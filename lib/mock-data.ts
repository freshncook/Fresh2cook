import { Lead, Order, Product, Task } from "./types";

export const leads: Lead[] = [
  {
    id: 1,
    name: "Priya Sharma",
    phone: "9876543210",
    area: "Rajouri Garden",
    source: "Facebook",
    interest: "Weekly Veg Box",
    status: "New",
    value: 699,
    nextFollowUp: "Today 5 PM",
    avatar: "PS",
  },
  {
    id: 2,
    name: "Amit Kumar",
    phone: "9876543211",
    area: "Janakpuri",
    source: "WhatsApp",
    interest: "Monthly Subscription",
    status: "Contacted",
    value: 1499,
    nextFollowUp: "Tomorrow",
    avatar: "AK",
  },
];

export const orders: Order[] = [
  {
    id: "ORD-1001",
    customer: "Priya Sharma",
    items: 3,
    amount: 699,
    status: "Pending",
    time: "10:30 AM",
  },
  {
    id: "ORD-1002",
    customer: "Amit Kumar",
    items: 5,
    amount: 1499,
    status: "Delivered",
    time: "11:15 AM",
  },
];

export const tasks: Task[] = [
  {
    id: 1,
    title: "Call Priya Sharma",
    customer: "Priya Sharma",
    due: "Today",
    type: "Call",
    done: false,
  },
  {
    id: 2,
    title: "WhatsApp Follow-up",
    customer: "Amit Kumar",
    due: "Tomorrow",
    type: "WhatsApp",
    done: false,
  },
];

export const products: Product[] = [
  { id: 1, name: "French Beans", category: "Beans", pack: "500g", price: 119, stock: 100 },
  { id: 2, name: "Drumstick", category: "Beans", pack: "500g", price: 119, stock: 100 },
  { id: 3, name: "Cluster Beans", category: "Beans", pack: "500g", price: 119, stock: 100 },
  { id: 4, name: "Chawli", category: "Beans", pack: "500g", price: 109, stock: 100 },
  { id: 5, name: "Matar", category: "Beans", pack: "500g", price: 39, stock: 100 },

  { id: 6, name: "Bottle Gourd", category: "Gourd", pack: "500g", price: 109, stock: 100 },
  { id: 7, name: "Pumpkin", category: "Gourd", pack: "500g", price: 89, stock: 100 },
  { id: 8, name: "Cucumber", category: "Gourd", pack: "500g", price: 79, stock: 100 },
  { id: 9, name: "Capsicum", category: "Gourd", pack: "500g", price: 109, stock: 100 },
  { id: 10, name: "Lady Finger", category: "Gourd", pack: "500g", price: 109, stock: 100 },

  { id: 11, name: "Carrot", category: "Root", pack: "500g", price: 99, stock: 100 },
  { id: 12, name: "Beetroot", category: "Root", pack: "500g", price: 99, stock: 100 },
  { id: 13, name: "Potato", category: "Root", pack: "1kg", price: 49, stock: 100 },
  { id: 14, name: "Ginger", category: "Root", pack: "250g", price: 99, stock: 100 },
  { id: 15, name: "Garlic", category: "Root", pack: "250g", price: 199, stock: 100 },

  { id: 16, name: "Cauliflower", category: "Daily Use", pack: "500g", price: 129, stock: 100 },
  { id: 17, name: "Cabbage", category: "Daily Use", pack: "500g", price: 109, stock: 100 },
  { id: 18, name: "Brinjal", category: "Daily Use", pack: "500g", price: 75, stock: 100 },
  { id: 19, name: "Sweet Corn", category: "Daily Use", pack: "500g", price: 89, stock: 100 },

  { id: 20, name: "Moong Sprout", category: "Sprouts", pack: "200g", price: 40, stock: 100 },
  { id: 21, name: "Chana Sprout", category: "Sprouts", pack: "200g", price: 40, stock: 100 },
  { id: 22, name: "Mix Sprout", category: "Sprouts", pack: "200g", price: 45, stock: 100 },

  { id: 23, name: "Pav Bhaji Mix", category: "Ready Mix", pack: "500g", price: 80, stock: 100 },
  { id: 24, name: "Pulav Mix", category: "Ready Mix", pack: "500g", price: 75, stock: 100 },
  { id: 25, name: "Chinese Mix", category: "Ready Mix", pack: "500g", price: 80, stock: 100 },

  { id: 26, name: "Button Mushroom", category: "Mushroom", pack: "200g", price: 75, stock: 100 },
  { id: 27, name: "Oyster Mushroom", category: "Mushroom", pack: "200g", price: 80, stock: 100 },

  { id: 28, name: "Onion", category: "Daily Use", pack: "1kg", price: 50, stock: 100 },
  { id: 29, name: "Tomato", category: "Daily Use", pack: "1kg", price: 45, stock: 100 },
];






