"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  pack?: string;
  image?: string | null;
};

export default function PaymentPage() {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState(0);

  const [transactionId, setTransactionId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(
      localStorage.getItem("freshcut-cart") || "[]"
    );

    const safeCart: CartItem[] = Array.isArray(storedCart)
      ? storedCart
      : [];

    setCart(safeCart);

    const storedTotal = Number(
      localStorage.getItem("freshcut-total") || 0
    );

    setTotal(storedTotal);

    const totalItems = safeCart.reduce(
      (sum: number, item: CartItem) =>
        sum + Number(item.qty || 1),
      0
    );

    setItems(totalItems);

    setCustomer(
      localStorage.getItem("freshcut-customer") || ""
    );

    setPhone(
      localStorage.getItem("freshcut-phone") || ""
    );

    setAddress(
      localStorage.getItem("freshcut-address") || ""
    );
  }, []);

  const upiUrl = `upi://pay?pa=ramakant.rao-1@okicici&pn=Fresh2Cook&am=${total}&cu=INR`;

  function getLocation() {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation(
          `${position.coords.latitude},${position.coords.longitude}`
        );
      },
      () => {
        alert("Unable to fetch location");
      }
    );
  }

  function openWhatsApp() {
    const cleanedPhone = phone.replace(/\D/g, "");

    const whatsappNumber =
      cleanedPhone.length === 10
        ? `91${cleanedPhone}`
        : cleanedPhone;

    const totalItems = cart.reduce(
      (sum: number, item: CartItem) =>
        sum + Number(item.qty || 1),
      0
    );

    const message = `
Fresh2Cook – Order Confirmation

Dear ${customer},

📍 Address:
${address}
${city} - ${pincode}

📞 Mobile: ${phone}

🧾 Order Summary
Items: ${totalItems}
Amount: ₹${total}
Status: PAID

📲 Instagram
https://www.instagram.com/fresh2cook2026

Thank you for choosing Fresh2Cook.

care@fresh2cook.in
Customer Care: 9811001901
`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  }

  async function completePayment() {
    if (!customer.trim())
      return alert("Enter Customer Name");

    if (!phone.trim())
      return alert("Enter Mobile Number");

    if (!address.trim())
      return alert("Enter Address");

    if (!transactionId.trim())
      return alert("Enter Transaction ID");

    try {
      setProcessing(true);

      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          phone,
          address,
          city,
          pincode,
          gpsLocation,
          amount: total,
          items: cart,
          transactionId,
          paymentStatus: "Paid",
        }),
      });

      setPaymentSuccess(true);

      setTimeout(() => {
        openWhatsApp();
      }, 1000);
    } catch (error) {
      console.error(error);
      alert("Order Failed");
    } finally {
      setProcessing(false);
    }
  }  const invoiceNumber =
    "INV" + Date.now();

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

        <div
          id="invoice"
          className="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden"
        >

          <img
            src="/Grocery Bag(1).png"
            alt="Watermark"
            className="absolute bottom-8 right-4 w-[420px] opacity-[0.04] pointer-events-none"
          />

          <div className="bg-green-700 text-white p-6">

            <div className="flex items-center justify-between">

              <img
                src="/fresh2cook-logo.png"
                alt="Fresh2Cook"
                className="h-20"
              />

              <div className="text-right">
                <h2 className="text-2xl font-bold">
                  TAX INVOICE
                </h2>

                <p>
                  Invoice No: {invoiceNumber}
                </p>

                <p>
                  {new Date().toLocaleDateString()}
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="grid md:grid-cols-2 gap-6 border-b pb-5">

              <div>

                <h3 className="font-bold text-lg">
                  Bill To
                </h3>

                <p>{customer}</p>
                <p>{phone}</p>
                <p>{address}</p>
                <p>
                  {city} - {pincode}
                </p>

              </div>

              <div>

                <p>
                  <strong>Email:</strong>
                  {" "}
                  care@fresh2cook.in
                </p>

                <p>
                  <strong>Customer Care:</strong>
                  {" "}
                  9811001901
                </p>

                <p>
                  <strong>Status:</strong>
                  {" "}
                  PAID
                </p>

              </div>

            </div>

            <table className="w-full mt-6 border text-sm">

              <thead>

                <tr className="bg-slate-50">

                  <th className="border p-2 text-left">
                    Product
                  </th>

                  <th className="border p-2">
                    Qty
                  </th>

                  <th className="border p-2">
                    Price
                  </th>

                  <th className="border p-2">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {cart.map((item) => (
                  <tr key={item.id}>

                    <td className="border p-2">
                      {item.name}
                    </td>

                    <td className="border p-2 text-center">
                      {item.qty}
                    </td>

                    <td className="border p-2 text-center">
                      ₹{item.price}
                    </td>

                    <td className="border p-2 text-center">
                      ₹{item.qty * item.price}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            <div className="mt-6 text-right">

              <div className="text-2xl font-bold text-green-700">
                Grand Total: ₹{total}
              </div>

              <div className="mt-2">
                Transaction ID:
                {" "}
                {transactionId}
              </div>

            </div>

            <div className="mt-8 border-t pt-5 text-center text-sm">

              <p>
                Thank you for choosing Fresh2Cook
              </p>

              <p>
                Fresh • Hygienic • Ready To Cook
              </p>

              <p>
                care@fresh2cook.in
              </p>

              <p>
                Customer Care: 9811001901
              </p>

            </div>

            <div className="mt-6 flex gap-3 print:hidden">

              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                Download Invoice
              </button>

              <button
                onClick={openWhatsApp}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
              >
                WhatsApp
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-extrabold mb-6 text-center">
          Checkout & Payment
        </h1>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="bg-green-50 rounded-2xl p-6 mb-6">

            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{items}</span>
            </div>

            <div className="flex justify-between mt-3">

              <span>Amount Payable</span>

              <span className="text-2xl font-bold text-green-700">
                ₹{total}
              </span>

            </div>

          </div>

          <div className="border rounded-2xl p-6 mb-6">

            <h2 className="text-2xl font-bold text-center">
              Scan QR & Pay
            </h2>

            <div className="flex justify-center mt-6">

              <QRCode
                value={upiUrl}
                size={280}
              />

            </div>

          </div>

          <h2 className="text-2xl font-bold mb-4">
            Customer Details
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              value={customer}
              onChange={(e) =>
                setCustomer(e.target.value)
              }
              placeholder="Customer Name"
              className="w-full border p-4 rounded-xl"
            />

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Mobile Number"
              className="w-full border p-4 rounded-xl"
            />

            <textarea
              rows={3}
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="Delivery Address"
              className="w-full border p-4 rounded-xl"
            />

            <input
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              placeholder="City"
              className="w-full border p-4 rounded-xl"
            />

            <input
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value)
              }
              placeholder="Pincode"
              className="w-full border p-4 rounded-xl"
            />

            <div className="flex gap-3">

              <input
                value={gpsLocation}
                readOnly
                placeholder="GPS Location"
                className="flex-1 border p-4 rounded-xl"
              />

              <button
                type="button"
                onClick={getLocation}
                className="bg-blue-600 text-white px-4 rounded-xl"
              >
                GPS
              </button>

            </div>

            <input
              value={transactionId}
              onChange={(e) =>
                setTransactionId(e.target.value)
              }
              placeholder="Transaction ID / UTR"
              className="w-full border p-4 rounded-xl"
            />

            <button
              onClick={completePayment}
              disabled={processing}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl"
            >
              {processing
                ? "Processing..."
                : "Confirm Payment"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}




