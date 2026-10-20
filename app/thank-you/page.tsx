"use client";

import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [order, setOrder] =
    useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-order"
      ) || "{}"
    );

    // Invoice number fallback: the order id saved by the payment page
    if (!data?.id) {
      const savedId = localStorage.getItem("freshcut-order-id");
      if (savedId) data.id = savedId;
    }
    setOrder(data);
  }, []);

  const invoiceNo = order?.id ? `F2C-${order.id}` : "-";
  const waPhone = (() => {
    const d = String(order?.phone || "").replace(/\D/g, "");
    return d.length === 10 ? `91${d}` : d;
  })();

  function sendWhatsApp() {
    let productText = "";

    order?.products?.forEach(
      (item: any) => {
        productText +=
          `* ${item.name} x ${item.qty}\n`;
      }
    );

    const msg =
`Fresh2Cook ORDER CONFIRMED
  
Thank You, ${order?.customer}
Address: ${order?.address}
Mobile: ${order?.phone}
 
Product Details:
${productText}
  
Subtotal: ₹${order?.subtotal}
Handling: ₹${order?.handling}
Delivery: ₹${order?.delivery}${order?.wallet ? `\nWallet used: -₹${order.wallet}` : ""}
*Paid: ₹${order?.total}*
  
Invoice No: ${invoiceNo}
UTR/TRN: ${order?.utr}
Payment: ${order?.paymentStatus}
Status: ${order?.status}
  
🙏 *THANK YOU FOR SHOPPING WITH FRESH2COOK!* 💚
_May this order bring health and happiness to your family._
Support: 9811001901`;

    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(
        msg
      )}`,
      "_blank"
    );
  }

  function downloadInvoice() {
    let products = "";

    order?.products?.forEach(
      (item: any) => {
        products +=
          `${item.name} x ${item.qty} = ₹${
            Number(item.price) *
            Number(item.qty)
          }\n`;
      }
    );

    const invoice = `
=======================================

              Fresh2Cook

=======================================

INVOICE NO:
${invoiceNo}

---------------------------------------

CUSTOMER

${order?.customer}

${order?.phone}

${order?.address}

---------------------------------------

PRODUCT DETAILS

${products}

---------------------------------------

SUBTOTAL
₹${order?.subtotal}

HANDLING
₹${order?.handling}

DELIVERY
₹${order?.delivery}

---------------------------------------

GRAND TOTAL
₹${order?.total}

---------------------------------------

UTR/TRN

${order?.utr}

---------------------------------------

PAYMENT STATUS

${order?.paymentStatus}

---------------------------------------

ORDER STATUS

${order?.status}

=======================================

THANK YOU

Fresh2Cook

Support: 9811001901

=======================================
`;

    const blob = new Blob(
      [invoice],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      `Fresh2Cook-Invoice-${invoiceNo}.txt`;

    a.click();
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">

      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">

          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 px-4 py-5 text-center text-white">
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="text-[13px] font-bold uppercase tracking-[0.2em] text-yellow-100">✓ Order confirmed</div>
            <h1 className="mt-1 text-[26px] font-black leading-tight drop-shadow-sm sm:text-[30px]">🙏 धन्यवाद · Thank You!</h1>
            <p className="mt-1 text-[13px] font-bold text-yellow-50">यह ऑर्डर आपके परिवार के स्वास्थ्य, खुशहाली और समृद्धि का कारण बने।</p>
          </div>

          <div className="p-3 sm:p-4">

            <div className="bg-green-50 rounded-xl p-3 mb-3 text-[13px]">

              <h2 className="text-[14px] font-extrabold mb-2">
                Invoice Summary
              </h2>

              <div className="space-y-2">

                <p>
                  <strong>Invoice:</strong>{" "}
                  {invoiceNo}
                </p>

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customer}
                </p>

                <p>
                  <strong>Mobile:</strong>{" "}
                  {order.phone}
                </p>

                <p>
                  <strong>Address:</strong>{" "}
                  {order.address}
                </p>

                <p>
                  <strong>UTR/TRN:</strong>{" "}
                  {order.utr}
                </p>

              </div>

            </div>

            <div className="bg-white border rounded-xl p-3 mb-3 text-[13px]">

              <h2 className="text-[14px] font-extrabold mb-2">
                Products
              </h2>

              {order?.products?.map(
                (
                  item: any,
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex justify-between border-b py-1.5"
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>

                    <span>
                      ₹
                      {Number(
                        item.price
                      ) *
                        Number(
                          item.qty
                        )}
                    </span>
                  </div>
                )
              )}

            </div>

            <div className="bg-blue-50 rounded-xl p-3 mb-3 text-[13px]">

              <div className="flex justify-between mb-2">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹{order.subtotal}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>
                  Handling
                </span>

                <span>
                  ₹{order.handling}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>
                  Delivery
                </span>

                <span>
                  ₹{order.delivery}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-[18px] font-black text-green-700">
                <span>
                  Total
                </span>

                <span>
                  ₹{order.total}
                </span>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={
                  sendWhatsApp
                }
                className="bg-green-600 text-white py-2.5 rounded-xl font-bold text-[13px]"
              >
                WhatsApp Invoice
              </button>

              <button
                onClick={
                  downloadInvoice
                }
                className="bg-blue-600 text-white py-2.5 rounded-xl font-bold text-[13px]"
              >
                Download Invoice
              </button>

            </div>

            <a
              href="/products"
              className="block text-center mt-6 bg-black text-white py-2.5 rounded-xl font-bold text-[13px]"
            >
              Continue Shopping
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}






