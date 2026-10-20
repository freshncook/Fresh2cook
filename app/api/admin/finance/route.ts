import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session-helpers";
import { readCostMap } from "@/lib/product-cost";
import { getStoreSettings } from "@/lib/store-settings";
import { packGrams } from "@/lib/pack-price";
import { istDayStart } from "@/lib/staff-tools";

export const dynamic = "force-dynamic";

/*
 * Admin > Finance — profit / loss from sales.
 * GET ?from=YYYY-MM-DD&to=YYYY-MM-DD   (default: this month, India time)
 *
 *   Sales           = delivered orders (amount the customer paid incl. handling + delivery)
 *   Product cost    = purchase rate x quantity (pack size adjusted)
 *   Rider pay       = rider earning on each delivered order
 *   Staff reward    = processing reward per packed order (Settings)
 *   Wallet used     = wallet / referral money customers spent on these orders
 *   Profit          = Sales - Product cost - Rider pay - Staff reward - Wallet used
 */

const DAY = 86400000;
const DONE = ["Delivered", "Completed"];
const DEAD = ["Cancelled", "Rejected"];

function parseDay(v: string | null, fallback: Date) {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return fallback;
  // India midnight of that date
  return new Date(new Date(v + "T00:00:00+05:30").getTime());
}

export async function GET(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });

  const url = new URL(req.url);
  const today = istDayStart(new Date());
  const ist = new Date(today.getTime() + 5.5 * 3600000);
  const monthStart = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - 5.5 * 3600000);
  const from = parseDay(url.searchParams.get("from"), monthStart);
  const toDay = parseDay(url.searchParams.get("to"), today);
  const to = new Date(toDay.getTime() + DAY); // end of "to" day

  const [orders, costs, shop] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { id: true, amount: true, status: true, createdAt: true, phone: true },
      orderBy: { id: "asc" },
    }),
    readCostMap(),
    getStoreSettings(),
  ]);

  const done = orders.filter((o) => DONE.includes(String(o.status)));
  const open = orders.filter((o) => !DONE.includes(String(o.status)) && !DEAD.includes(String(o.status)));
  const cancelled = orders.filter((o) => DEAD.includes(String(o.status)));
  const doneIds = done.map((o) => o.id);

  const ids = doneIds.length ? doneIds : [-1];
  const [items, products, assignments, walletRows] = await Promise.all([
    prisma.orderItem.findMany({ where: { orderId: { in: ids } } }),
    prisma.product.findMany({ select: { id: true, name: true, pack: true, category: true } }),
    prisma.deliveryAssignment.findMany({ where: { orderId: { in: ids }, status: "Delivered" }, select: { orderId: true, earnings: true } }),
    prisma.walletTransaction.findMany({ where: { type: { in: ids.map((id) => `Used on order #${id}`) } }, select: { credit: true, type: true } }),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));

  // ----- product cost -----
  type Row = { id: number; name: string; category: string; qty: number; sales: number; cost: number; missing: boolean };
  const byProduct = new Map<number, Row>();
  let itemSales = 0;
  let productCost = 0;
  let salesWithoutCost = 0;
  for (const it of items) {
    const p = productById.get(it.productId);
    const unitCost = Number(costs[String(it.productId)] || 0);
    const base = packGrams(p?.pack);
    const want = packGrams(it.pack || p?.pack);
    const ratio = base && want ? want / base : 1;
    const lineSales = Number(it.total || it.price * it.quantity || 0);
    const lineCost = unitCost > 0 ? unitCost * ratio * it.quantity : 0;
    itemSales += lineSales;
    if (unitCost > 0) productCost += lineCost;
    else salesWithoutCost += lineSales;
    const row = byProduct.get(it.productId) || {
      id: it.productId,
      name: p?.name || it.productName,
      category: p?.category || "",
      qty: 0,
      sales: 0,
      cost: 0,
      missing: !(unitCost > 0),
    };
    row.qty += it.quantity;
    row.sales += lineSales;
    row.cost += lineCost;
    byProduct.set(it.productId, row);
  }

  const sales = done.reduce((s, o) => s + Number(o.amount || 0), 0);
  const charges = Math.max(0, sales - itemSales); // handling + delivery charges collected
  const riderByOrder = new Map(assignments.map((a) => [a.orderId, Number(a.earnings || 0)]));
  const riderPay = done.reduce((s, o) => s + (riderByOrder.get(o.id) ?? 0), 0);
  const staffReward = done.length * Number(shop.processingReward || 0);
  const walletUsed = walletRows.reduce((s, w) => s + Math.abs(Number(w.credit || 0)), 0);
  const profit = sales - productCost - riderPay - staffReward - walletUsed;

  // ----- day by day -----
  const days: { date: string; orders: number; sales: number; cost: number; profit: number }[] = [];
  const costByOrder = new Map<number, number>();
  for (const it of items) {
    const p = productById.get(it.productId);
    const unitCost = Number(costs[String(it.productId)] || 0);
    const base = packGrams(p?.pack);
    const want = packGrams(it.pack || p?.pack);
    const ratio = base && want ? want / base : 1;
    costByOrder.set(it.orderId, (costByOrder.get(it.orderId) || 0) + (unitCost > 0 ? unitCost * ratio * it.quantity : 0));
  }
  for (let t = from.getTime(); t < to.getTime() && days.length < 62; t += DAY) {
    const dayOrders = done.filter((o) => o.createdAt.getTime() >= t && o.createdAt.getTime() < t + DAY);
    const dSales = dayOrders.reduce((s, o) => s + o.amount, 0);
    const dCost = dayOrders.reduce((s, o) => s + (costByOrder.get(o.id) || 0) + (riderByOrder.get(o.id) || 0) + Number(shop.processingReward || 0), 0);
    days.push({
      date: new Date(t + 5.5 * 3600000).toISOString().slice(0, 10),
      orders: dayOrders.length,
      sales: dSales,
      cost: Math.round(dCost),
      profit: Math.round(dSales - dCost),
    });
  }

  const productsList = [...byProduct.values()]
    .map((r) => ({ ...r, cost: Math.round(r.cost), profit: r.missing ? null : Math.round(r.sales - r.cost) }))
    .sort((a, b) => b.sales - a.sales);

  return NextResponse.json({
    success: true,
    range: { from: from.toISOString(), to: toDay.toISOString() },
    totals: {
      orders: done.length,
      openOrders: open.length,
      openValue: open.reduce((s, o) => s + o.amount, 0),
      cancelled: cancelled.length,
      sales,
      itemSales,
      charges,
      productCost: Math.round(productCost),
      riderPay,
      staffReward,
      walletUsed,
      profit: Math.round(profit),
      margin: sales > 0 ? Math.round((profit / sales) * 1000) / 10 : 0,
      salesWithoutCost,
      productsWithoutCost: productsList.filter((p) => p.missing).length,
      avgOrder: done.length ? Math.round(sales / done.length) : 0,
    },
    days,
    products: productsList,
  });
}
