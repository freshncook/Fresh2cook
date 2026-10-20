"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useStoreSettings } from "@/lib/use-store-settings";
import { repriceCart } from "@/lib/cart-reprice";

/*
 * Payment — compact, mobile first.
 * Delivery details · order summary · bill with wallet · UPI QR + UTR · place order.
 * After the order: compact invoice with a bold "Thank you" band (print / WhatsApp).
 */

type CartItem = {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  qty: number;
  pack?: string;
  image?: string | null;
};

const UPI_ID = "ramakant.rao-1@okicici";
const SUPPORT = "9811001901";
const PLACEHOLDER = "/placeholder-product.png";
const rupees = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

function numberToWords(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => (n < 20 ? a[n] : `${b[Math.floor(n / 10)]}${n % 10 ? " " + a[n % 10] : ""}`);
  const three = (n: number) => (n >= 100 ? `${a[Math.floor(n / 100)]} Hundred${n % 100 ? " " + two(n % 100) : ""}` : two(n));
  num = Math.round(num);
  if (num === 0) return "Zero Rupees Only";
  const parts: string[] = [];
  const lakh = Math.floor(num / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return `${parts.join(" ")} Rupees Only`;
}

type Placed = {
  id: number;
  otp: string;
  date: string;
  items: CartItem[];
  customer: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  mrpTotal: number;
  subtotal: number;
  handling: number;
  delivery: number;
  total: number;
  wallet: number;
  paid: number;
  utr: string;
};

export default function PaymentPage() {
  const settings = useStoreSettings();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [waBusy, setWaBusy] = useState(false);
  const [catalog, setCatalog] = useState<{ id: number; price: number; mrp?: number; pack?: string }[]>([]);

  // Bill always uses today's shop price (the server checks it too)
  useEffect(() => {
    if (!settings.ready || !catalog.length) return;
    setCart((cur) => {
      const r = repriceCart(cur, catalog, settings);
      if (!r.changed) return cur;
      try {
        const saved = JSON.parse(localStorage.getItem("freshcut-cart") || "[]");
        if (Array.isArray(saved)) localStorage.setItem("freshcut-cart", JSON.stringify(repriceCart(saved, catalog, settings).items));
      } catch {
        /* ignore */
      }
      return r.items;
    });
  }, [catalog, settings]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [pincode, setPincode] = useState("");
  const [gps, setGps] = useState("");
  const [utr, setUtr] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);

  useEffect(() => {
    let items: CartItem[] = [];
    try {
      const c = JSON.parse(localStorage.getItem("freshcut-cart") || "[]");
      items = Array.isArray(c) ? c : [];
      setCustomer(localStorage.getItem("freshcut-customer") || "");
      setPhone(localStorage.getItem("freshcut-phone") || "");
      setAddress(localStorage.getItem("freshcut-address") || "");
      setPincode(localStorage.getItem("freshcut-pincode") || "");
    } catch {
      /* ignore */
    }
    setCart(items);

    // pictures for the summary
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        const map = new Map((Array.isArray(list) ? list : []).map((p: { id: number; image?: string }) => [p.id, p.image]));
        setCart((cur) => cur.map((i) => ({ ...i, image: (i.image && !String(i.image).startsWith("data:") ? i.image : "") || (map.get(i.id) as string) || null })));
        setCatalog(Array.isArray(list) ? list : []);
      })
      .catch(() => undefined);

    // logged-in customer: name, mobile, wallet
    fetch("/api/customer-account", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.loggedIn) return;
        setLoggedIn(true);
        setWalletBalance(Number(j.wallet?.balance || 0));
        setCustomer((v) => v || j.profile?.name || "");
        setPhone((v) => v || j.profile?.mobile || "");
      })
      .catch(() => undefined);
  }, []);

  const bill = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 1), 0);
    const mrpTotal = cart.reduce((s, i) => s + Math.max(Number(i.mrp || 0), Number(i.price || 0)) * Number(i.qty || 1), 0);
    const count = cart.reduce((s, i) => s + Number(i.qty || 1), 0);
    const freeDelivery = subtotal >= settings.freeDeliveryTarget;
    const handling = subtotal > 0 ? settings.handlingCharge : 0;
    const delivery = freeDelivery || subtotal === 0 ? 0 : settings.deliveryCharge;
    const total = subtotal + handling + delivery;
    const wallet = loggedIn && useWallet ? Math.min(walletBalance, total) : 0;
    const toPay = Math.max(0, total - wallet);
    const saving = Math.max(0, mrpTotal - subtotal) + (freeDelivery ? settings.deliveryCharge : 0);
    return { subtotal, mrpTotal, count, handling, delivery, total, wallet, toPay, saving, freeDelivery };
  }, [cart, settings, loggedIn, useWallet, walletBalance]);

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Fresh2Cook&am=${bill.toPay}&cu=INR`;

  function getLocation() {
    if (!navigator.geolocation) return setError("Location is not supported on this device");
    navigator.geolocation.getCurrentPosition(
      (p) => setGps(`${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`),
      () => setError("Could not get your location")
    );
  }

  async function placeOrder() {
    setError("");
    const mobile = phone.replace(/\D/g, "").slice(-10);
    if (!customer.trim()) return setError("Please enter your name");
    if (!/^\d{10}$/.test(mobile)) return setError("Please enter a valid 10-digit mobile number");
    if (!address.trim()) return setError("Please enter the delivery address");
    if (!cart.length) return setError("Your cart is empty");
    if (bill.toPay > 0 && !utr.trim()) return setError("Pay by UPI and enter the Transaction ID / UTR");

    setBusy(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customer.trim(),
          phone: mobile,
          address: [address.trim(), city.trim(), pincode.trim()].filter(Boolean).join(", "),
          amount: bill.total,
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, pack: i.pack, mrp: i.mrp })),
          transactionId: utr.trim() || (bill.wallet ? "WALLET" : ""),
          paymentStatus: "Paid",
          city,
          pincode,
          gpsLocation: gps,
          walletUsed: bill.wallet,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Could not place the order");
      const id = Number(data?.order?.id || 0);
      const otp = String(data?.deliveryOtp || data?.order?.deliveryOtp || "");

      let walletUsed = 0;
      if (bill.wallet > 0 && id) {
        const w = await fetch("/api/wallet/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, amount: bill.wallet }),
        })
          .then((x) => x.json())
          .catch(() => null);
        walletUsed = Number(w?.used || 0);
      }

      const done: Placed = {
        id,
        otp,
        date: new Date().toLocaleDateString("en-GB"),
        items: cart,
        customer: customer.trim(),
        phone: mobile,
        address: address.trim(),
        city,
        pincode,
        mrpTotal: bill.mrpTotal,
        subtotal: bill.subtotal,
        handling: bill.handling,
        delivery: bill.delivery,
        total: bill.total,
        wallet: walletUsed,
        paid: Math.max(0, bill.total - walletUsed),
        utr: utr.trim(),
      };

      try {
        localStorage.setItem("freshcut-customer", done.customer);
        localStorage.setItem("freshcut-phone", done.phone);
        localStorage.setItem("freshcut-address", done.address);
        localStorage.setItem("freshcut-pincode", pincode);
        localStorage.setItem("freshcut-order-id", String(id));
        localStorage.setItem(
          "freshcut-order",
          JSON.stringify({
            id,
            customer: done.customer,
            phone: done.phone,
            address: done.address,
            products: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price, pack: i.pack })),
            subtotal: done.subtotal,
            handling: done.handling,
            delivery: done.delivery,
            wallet: done.wallet,
            total: done.paid,
            utr: done.utr,
            paymentStatus: "Paid",
            status: "Pending",
          })
        );
        localStorage.removeItem("freshcut-cart");
        window.dispatchEvent(new Event("cartUpdated"));
      } catch {
        /* ignore */
      }

      fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobile, name: customer }),
      }).catch(() => undefined);

      setPlaced(done);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  function sendWhatsApp(o: Placed) {
    const lines = o.items.map((i) => `• ${i.name} (${i.pack || "-"}) × ${i.qty} = ₹${i.price * i.qty}`).join("\n");
    const msg = [
      `🥬 *Fresh2Cook — Order Confirmed*`,
      ``,
      `Invoice No: *F2C-${o.id}*`,
      `Name: ${o.customer}`,
      `Address: ${o.address}${o.pincode ? " - " + o.pincode : ""}`,
      ``,
      `*Items*`,
      lines,
      ``,
      `Subtotal: ₹${o.subtotal}`,
      `Handling: ₹${o.handling}`,
      `Delivery: ${o.delivery ? "₹" + o.delivery : "FREE"}`,
      o.wallet ? `Wallet used: −₹${o.wallet}` : "",
      `*Paid: ₹${o.paid}*`,
      ``,
      `🔐 Delivery OTP: *${o.otp || "-"}* (share only when you receive the order)`,
      ``,
      `🙏 *THANK YOU FOR SHOPPING WITH FRESH2COOK!* 💚`,
      `_May this order bring health and happiness to your family._`,
      `Customer care: ${SUPPORT}`,
    ]
      .filter((l) => l !== "")
      .join("\n");
    // open WhatsApp only once (a quick double tap used to send the message twice)
    if (waBusy) return;
    setWaBusy(true);
    window.setTimeout(() => setWaBusy(false), 4000);
    const url = `https://wa.me/91${o.phone}?text=${encodeURIComponent(msg)}`;
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = url;
    else window.open(url, "_blank", "noopener");
  }

  /* ================= INVOICE (after order) ================= */
  if (placed) {
    const saving = Math.max(0, placed.mrpTotal - placed.subtotal);
    const count = placed.items.reduce((s, i) => s + Number(i.qty || 1), 0);
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-100 px-2 py-4 sm:px-3">
        <style>{`@media print { @page { size: A5 portrait; margin: 6mm } header, footer, .no-print { display: none !important } body { background: #fff !important } #invoice { box-shadow: none !important } .print-bg { -webkit-print-color-adjust: exact; print-color-adjust: exact } }`}</style>

        {/* success strip */}
        <div className="no-print mx-auto mb-3 flex max-w-2xl items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-emerald-200">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[16px] font-black text-white">✓</span>
          <div className="min-w-0 leading-tight">
            <div className="text-[14px] font-extrabold text-slate-900">Order placed successfully</div>
            <div className="text-[11px] text-slate-500">We are packing it fresh for you. Keep the OTP ready for delivery.</div>
          </div>
        </div>

        <div id="invoice" className="print-bg mx-auto max-w-2xl overflow-hidden rounded-2xl border-2 border-emerald-600 bg-white shadow-[0_10px_30px_-12px_rgba(5,150,105,0.35)]">
          {/* header */}
          <div className="print-bg relative flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png.png" alt="Fresh2Cook" className="h-11 w-auto rounded-lg bg-white px-1.5 py-0.5 shadow" onError={(e) => (e.currentTarget.style.display = "none")} />
              <div className="hidden leading-tight sm:block">
                <div className="text-[13px] font-extrabold">Fresh2Cook</div>
                <div className="text-[10px] text-emerald-100">Cut · Clean · Cook</div>
              </div>
            </div>
            <div className="text-right leading-tight">
              <div className="text-[16px] font-black tracking-[0.15em]">INVOICE</div>
              <div className="mt-0.5 inline-block rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold ring-1 ring-white/30">
                F2C-{placed.id} · {placed.date}
              </div>
            </div>
          </div>
          <div className="print-bg h-1.5 bg-gradient-to-r from-lime-400 via-yellow-300 to-orange-400" />

          {/* billed to / payment */}
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-[12px]">
              <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Billed to</div>
              <div className="text-[13px] font-extrabold text-slate-900">{placed.customer}</div>
              <div className="font-semibold text-slate-600">📞 {placed.phone}</div>
              <div className="text-slate-600">
                📍 {placed.address}
                {placed.pincode && !placed.address.includes(placed.pincode) ? ` - ${placed.pincode}` : ""}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-[12px] sm:text-right">
              <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Payment</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-extrabold text-white">✓ PAID</div>
              {placed.utr && <div className="mt-0.5 text-slate-600">UTR: <b>{placed.utr}</b></div>}
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-2 py-1 text-[12px] font-extrabold text-amber-800">
                🔐 Delivery OTP <span className="ml-1 text-[15px] tracking-[0.3em] text-rose-600">{placed.otp || "-"}</span>
              </div>
            </div>
          </div>

          {/* items */}
          <div className="px-3">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="print-bg bg-emerald-50 text-left text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    <th className="border-b border-emerald-200 px-2 py-1.5">#</th>
                    <th className="border-b border-emerald-200 px-2 py-1.5">Item</th>
                    <th className="border-b border-emerald-200 px-2 py-1.5 text-center">Qty</th>
                    <th className="hidden border-b border-emerald-200 px-2 py-1.5 text-right sm:table-cell">MRP</th>
                    <th className="border-b border-emerald-200 px-2 py-1.5 text-right">Price</th>
                    <th className="border-b border-emerald-200 px-2 py-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {placed.items.map((i, n) => (
                    <tr key={n} className={n % 2 ? "bg-slate-50/70" : "bg-white"}>
                      <td className="border-b border-slate-100 px-2 py-1.5 text-slate-400">{n + 1}</td>
                      <td className="border-b border-slate-100 px-2 py-1.5">
                        <span className="font-bold text-slate-900">{i.name}</span>
                        {i.pack && <span className="ml-1 rounded bg-emerald-100 px-1 text-[10px] font-bold text-emerald-800">{i.pack}</span>}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1.5 text-center font-semibold">{i.qty}</td>
                      <td className="hidden border-b border-slate-100 px-2 py-1.5 text-right text-slate-400 line-through decoration-red-500 sm:table-cell">
                        {Number(i.mrp || 0) > i.price ? `₹${i.mrp}` : ""}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1.5 text-right">₹{i.price}</td>
                      <td className="border-b border-slate-100 px-2 py-1.5 text-right font-extrabold text-slate-900">₹{i.price * i.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* totals */}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-[11px] text-slate-500 sm:pt-1">
                {placed.items.length} products · {count} items
                {saving > 0 && (
                  <div className="mt-1 inline-block rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700 ring-1 ring-emerald-200">🎉 You saved {rupees(saving)} on this order</div>
                )}
              </div>
              <div className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] sm:max-w-[260px]">
                <Line label="Subtotal" value={rupees(placed.subtotal)} />
                {saving > 0 && <Line label="You saved on MRP" value={`− ${rupees(saving)}`} tone="green" />}
                <Line label="Handling" value={rupees(placed.handling)} />
                <Line label="Delivery" value={placed.delivery ? rupees(placed.delivery) : "FREE"} tone={placed.delivery ? undefined : "green"} />
                <Line label="Order total" value={rupees(placed.total)} />
                {placed.wallet > 0 && <Line label="Wallet used" value={`− ${rupees(placed.wallet)}`} tone="violet" />}
                <div className="print-bg mt-1.5 flex items-center justify-between rounded-lg bg-emerald-600 px-2 py-1.5 text-[15px] font-black text-white">
                  <span>Paid</span>
                  <span>{rupees(placed.paid)}</span>
                </div>
                <div className="mt-0.5 text-right text-[10px] text-slate-400">{numberToWords(placed.paid)}</div>
              </div>
            </div>
          </div>

          {/* Thank you band */}
          <div className="print-bg relative mx-3 mb-3 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 px-4 py-3 text-center text-white">
            <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="text-[22px] font-black leading-tight tracking-wide drop-shadow-sm">🙏 धन्यवाद · Thank You!</div>
            <div className="mt-0.5 text-[13px] font-bold text-yellow-100">यह ऑर्डर आपके परिवार के स्वास्थ्य, खुशहाली और समृद्धि का कारण बने।</div>
            <div className="mt-1 text-[11px] font-semibold text-white/90">Fresh · Hygienic · Ready to Cook — Fresh2Cook 💚</div>
          </div>
          <div className="print-bg border-t border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-2 text-center text-[10px] font-semibold text-slate-500">
            care@fresh2cook.in · Customer care {SUPPORT} · This is a computer generated invoice
          </div>
        </div>

        <div className="no-print mx-auto mt-3 grid max-w-2xl grid-cols-3 gap-2">
          <button onClick={() => window.print()} className="rounded-xl bg-slate-900 py-2.5 text-[13px] font-bold text-white shadow-sm">
            🖨 Print
          </button>
          <button
            onClick={() => sendWhatsApp(placed)}
            disabled={waBusy}
            className="rounded-xl bg-[#25D366] py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-60"
          >
            {waBusy ? "Opening…" : "💬 WhatsApp"}
          </button>
          <a href="/track-order" className="rounded-xl bg-emerald-600 py-2.5 text-center text-[13px] font-bold text-white shadow-sm">
            📍 Track order
          </a>
        </div>
      </div>
    );
  }

  /* ================= CHECKOUT ================= */
  if (!cart.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-2 text-[18px] font-extrabold">Your cart is empty</h1>
        <a href="/products" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-[14px] font-bold text-white">
          Shop now
        </a>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-8">
      <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-4">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-[17px] font-extrabold text-slate-900">Checkout</h1>
          <a href="/cart" className="text-[12px] font-bold text-emerald-700">
            ← Edit cart
          </a>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            {/* 1. Delivery details */}
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
                <Step n={1} /> Delivery details
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Full name" className={input} autoComplete="name" />
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 13))} placeholder="Mobile number" inputMode="numeric" className={input} autoComplete="tel" />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, landmark" rows={2} className={`${input} sm:col-span-2`} autoComplete="street-address" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={input} />
                <div className="flex gap-2">
                  <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" inputMode="numeric" className={input} />
                  <button type="button" onClick={getLocation} className={`shrink-0 rounded-lg border px-2.5 text-[12px] font-bold ${gps ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-300 text-slate-700"}`}>
                    {gps ? "📍 Added" : "📍 GPS"}
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Items */}
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <h2 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
                <Step n={2} /> {bill.count} items
              </h2>
              <div className="divide-y divide-slate-100">
                {cart.map((i, n) => (
                  <div key={n} className="flex items-center gap-2 py-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image || PLACEHOLDER} alt="" className="h-10 w-10 shrink-0 rounded-md border border-slate-100 bg-slate-50 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-bold text-slate-800">{i.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {i.pack} · {i.qty} × ₹{i.price}
                      </div>
                    </div>
                    <div className="text-right text-[12px] font-extrabold">₹{i.price * i.qty}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-3 lg:sticky lg:top-24">
            {/* 3. Bill + wallet */}
            <section className="rounded-xl border border-slate-200 bg-white p-3 text-[12px]">
              <h2 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
                <Step n={3} /> Bill details
              </h2>
              <Line label="Items total (MRP)" value={rupees(bill.mrpTotal)} />
              <Line label="Product discount" value={`− ${rupees(Math.max(0, bill.mrpTotal - bill.subtotal))}`} tone="green" />
              <Line label="Handling charge" value={rupees(bill.handling)} />
              <Line label="Delivery charge" value={bill.delivery ? rupees(bill.delivery) : "FREE"} tone={bill.delivery ? undefined : "green"} />
              <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-800">
                <span>Order total</span>
                <span>{rupees(bill.total)}</span>
              </div>

              {loggedIn ? (
                <label className={`mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 ring-1 ${walletBalance > 0 ? "bg-violet-50 ring-violet-200" : "bg-slate-50 ring-slate-200"}`}>
                  <input type="checkbox" checked={useWallet && walletBalance > 0} disabled={walletBalance <= 0} onChange={(e) => setUseWallet(e.target.checked)} className="h-4 w-4 accent-violet-600" />
                  <span className="flex-1">
                    <span className="font-bold text-slate-800">👛 Wallet balance</span>{" "}
                    <span className="text-slate-500">({rupees(walletBalance)})</span>
                  </span>
                  <span className="font-extrabold text-violet-700">{bill.wallet ? `− ${rupees(bill.wallet)}` : rupees(0)}</span>
                </label>
              ) : (
                <a href="/login?next=/payment" className="mt-2 block rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                  👛 Log in to use your wallet balance →
                </a>
              )}

              <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-600 px-3 py-2 text-white">
                <span className="text-[13px] font-bold">To pay</span>
                <span className="text-[18px] font-black tabular-nums">{rupees(bill.toPay)}</span>
              </div>
              {bill.saving > 0 && <p className="mt-1.5 text-center text-[11px] font-bold text-emerald-700">You save {rupees(bill.saving)} on this order 🎉</p>}
            </section>

            {/* 4. Pay */}
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
                <Step n={4} /> {bill.toPay > 0 ? "Pay by UPI" : "Paid by wallet"}
              </h2>
              {bill.toPay > 0 ? (
                <div className="flex gap-3">
                  <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5">
                    <QRCode value={upiUrl} size={104} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 text-[11px] text-slate-600">
                    <p>
                      Scan with any UPI app and pay <b className="text-slate-900">{rupees(bill.toPay)}</b>
                    </p>
                    <a href={upiUrl} className="block rounded-lg bg-slate-900 py-1.5 text-center text-[12px] font-bold text-white lg:hidden">
                      Open UPI app
                    </a>
                    <input value={utr} onChange={(e) => setUtr(e.target.value.trim().slice(0, 40))} placeholder="Transaction ID / UTR" className={input} />
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-600">Your wallet covers the full amount — no UPI payment needed.</p>
              )}
              {error && <p className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-[12px] font-semibold text-rose-700">{error}</p>}
              <button
                onClick={() => void placeOrder()}
                disabled={busy}
                className="mt-2 hidden w-full rounded-xl bg-emerald-600 py-3 text-[14px] font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50 lg:block"
              >
                {busy ? "Placing order…" : `Place order · ${rupees(bill.toPay)}`}
              </button>
            </section>
          </aside>
        </div>
      </div>

      {/* Sticky bar — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        {error && <p className="mb-1 text-center text-[11px] font-semibold text-rose-600">{error}</p>}
        <button onClick={() => void placeOrder()} disabled={busy} className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg disabled:opacity-60">
          <span className="text-left leading-tight">
            <span className="block text-[15px] font-extrabold">{rupees(bill.toPay)}</span>
            <span className="text-[10px] font-semibold opacity-90">{bill.wallet ? `after ${rupees(bill.wallet)} wallet` : "TO PAY"}</span>
          </span>
          <span className="text-[14px] font-extrabold">{busy ? "Placing…" : "Place order →"}</span>
        </button>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">{n}</span>;
}

function Line({ label, value, tone }: { label: string; value: string; tone?: "green" | "violet" }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold tabular-nums ${tone === "green" ? "text-emerald-700" : tone === "violet" ? "text-violet-700" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
