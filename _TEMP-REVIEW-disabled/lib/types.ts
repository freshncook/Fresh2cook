export type LeadStatus = "New" | "Contacted" | "Trial" | "Converted" | "Lost";
export type OrderStatus = "Pending" | "Packed" | "Out for delivery" | "Delivered";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  area: string;
  source: string;
  interest: string;
  status: LeadStatus;
  value: number;
  nextFollowUp: string;
  avatar: string;
};

export type Order = {
  id: string;
  customer: string;
  items: number;
  amount: number;
  status: OrderStatus;
  time: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  pack: string;
  price: number;
  stock: number;
};

export type Task = {
  id: number;
  title: string;
  customer: string;
  due: string;
  type: "Call" | "WhatsApp" | "Delivery" | "Task";
  done: boolean;
};





