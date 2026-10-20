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

    setOrder(data);
  }, []);

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
  
Subtotal: â‚¹${order?.subtotal}
Handling: â‚¹${order?.handling}
Delivery: â‚¹${order?.delivery}
Grand Total: â‚¹${order?.total}
  
Invoice: FC-${order?.id}
UTR/TRN: ${order?.utr}
Payment: ${order?.paymentStatus}
Status: ${order?.status}
  
Thank You
Team Fresh2Cook
Support: 9811001901`;

    window.open(
      `https://wa.me/${order?.phone}?text=${encodeURIComponent(
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
          `${item.name} x ${item.qty} = â‚¹${
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
FC-${order?.id}

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
â‚¹${order?.subtotal}

HANDLING
â‚¹${order?.handling}

DELIVERY
â‚¹${order?.delivery}

---------------------------------------

GRAND TOTAL
â‚¹${order?.total}

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
      `FreshCut-Invoice-FC-${order?.id}.txt`;

    a.click();
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">

          <div className="bg-green-600 text-white text-center p-8">

            <h1 className="text-5xl font-bold">
              Order Confirmed
            </h1>

            <p className="mt-2">
              Thank You For Ordering
            </p>

          </div>

          <div className="p-8">

            <div className="bg-green-50 rounded-2xl p-6 mb-6">

              <h2 className="text-2xl font-bold mb-4">
                Invoice Summary
              </h2>

              <div className="space-y-2">

                <p>
                  <strong>Invoice:</strong>{" "}
                  FC-{order.id}
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

            <div className="bg-white border rounded-2xl p-6 mb-6">

              <h2 className="text-2xl font-bold mb-4">
                Products
              </h2>

              {order?.products?.map(
                (
                  item: any,
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex justify-between border-b py-3"
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>

                    <span>
                      â‚¹
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

            <div className="bg-blue-50 rounded-2xl p-6 mb-6">

              <div className="flex justify-between mb-2">
                <span>
                  Subtotal
                </span>

                <span>
                  â‚¹{order.subtotal}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>
                  Handling
                </span>

                <span>
                  â‚¹{order.handling}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>
                  Delivery
                </span>

                <span>
                  â‚¹{order.delivery}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-3xl font-bold text-green-700">
                <span>
                  Total
                </span>

                <span>
                  â‚¹{order.total}
                </span>
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <button
                onClick={
                  sendWhatsApp
                }
                className="bg-green-600 text-white py-4 rounded-xl font-bold"
              >
                WhatsApp Invoice
              </button>

              <button
                onClick={
                  downloadInvoice
                }
                className="bg-blue-600 text-white py-4 rounded-xl font-bold"
              >
                Download Invoice
              </button>

            </div>

            <a
              href="/products"
              className="block text-center mt-6 bg-black text-white py-4 rounded-xl font-bold"
            >
              Continue Shopping
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}




