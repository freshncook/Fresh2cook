"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

type CartItem = {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  qty: number;
  pack?: string;
  image?: string | null;
};

type ApiProduct = {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  pack?: string;
  image?: string | null;
};

const FREE_DELIVERY_LIMIT = 400;
const DELIVERY_CHARGE = 40;
const HANDLING_CHARGE = 10;

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function belowThousand(n: number): string {
    let result = "";

    if (n >= 100) {
      result +=
        ones[Math.floor(n / 100)] +
        " Hundred";
      n %= 100;

      if (n > 0) {
        result += " ";
      }
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;

      if (n > 0) {
        result +=
          " " + ones[n];
      }
    } else if (n > 0) {
      result += ones[n];
    }

    return result;
  }

  if (!Number.isFinite(num)) {
    return "Zero Rupees Only";
  }

  num = Math.round(num);

  if (num === 0) {
    return "Zero Rupees Only";
  }

  let result = "";

  if (num >= 10000000) {
    result +=
      belowThousand(
        Math.floor(
          num / 10000000
        )
      ) +
      " Crore";

    num %= 10000000;

    if (num > 0) {
      result += " ";
    }
  }

  if (num >= 100000) {
    result +=
      belowThousand(
        Math.floor(
          num / 100000
        )
      ) +
      " Lakh";

    num %= 100000;

    if (num > 0) {
      result += " ";
    }
  }

  if (num >= 1000) {
    result +=
      belowThousand(
        Math.floor(
          num / 1000
        )
      ) +
      " Thousand";

    num %= 1000;

    if (num > 0) {
      result += " ";
    }
  }

  if (num > 0) {
    result += belowThousand(num);
  }

  return `${result.trim()} Rupees Only`;
}

export default function PaymentPage() {
  const [customer, setCustomer] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  const [gpsLocation, setGpsLocation] =
    useState("");

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [transactionId, setTransactionId] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const [orderId, setOrderId] =
    useState<number | null>(null);

  const [deliveryOtp, setDeliveryOtp] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const storedCart = JSON.parse(
          localStorage.getItem(
            "freshcut-cart"
          ) || "[]"
        );

        const safeCart: CartItem[] =
          Array.isArray(storedCart)
            ? storedCart
            : [];

        const customerValue =
          localStorage.getItem(
            "freshcut-customer"
          ) || "";

        const phoneValue =
          localStorage.getItem(
            "freshcut-phone"
          ) || "";

        const addressValue =
          localStorage.getItem(
            "freshcut-address"
          ) || "";

        setCustomer(customerValue);
        setPhone(phoneValue);
        setAddress(addressValue);

        try {
          const response =
            await fetch(
              "/api/products",
              {
                cache: "no-store",
              }
            );

          if (response.ok) {
            const products: ApiProduct[] =
              await response.json();

            const productMap =
              new Map(
                products.map(
                  (product) => [
                    product.id,
                    product,
                  ]
                )
              );

            const enrichedCart =
              safeCart.map(
                (item) => {
                  const product =
                    productMap.get(
                      item.id
                    );

                  const currentPack =
  item.pack ||
  product?.pack ||
  "250g";

const baseMrp =
  Number(
    product?.mrp ||
    item.mrp ||
    item.price ||
    0
  );

const calculatedMrp =
  currentPack === "500g"
    ? baseMrp * 2
    : currentPack === "1kg"
    ? baseMrp * 4
    : baseMrp;

return {
  ...item,
  mrp: calculatedMrp,
  pack: currentPack,
  image:
    product?.image ||
    item.image ||
    null,
};
                }
              );

            setCart(
              enrichedCart
            );

            return;
          }
        } catch (error) {
          console.error(
            "PRODUCT MRP LOAD ERROR:",
            error
          );
        }

        setCart(safeCart);
      } catch (error) {
        console.error(
          "PAYMENT LOAD ERROR:",
          error
        );

        setCart([]);
      }
    }

    loadData();
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.qty || 1),
      0
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 1),
      0
    );
  }, [cart]);

  const freeDeliveryUnlocked =
    subtotal >=
    FREE_DELIVERY_LIMIT;

  const delivery =
    freeDeliveryUnlocked
      ? 0
      : DELIVERY_CHARGE;

  const total =
    subtotal +
    HANDLING_CHARGE +
    delivery;

  const amountForFreeDelivery =
    Math.max(
      FREE_DELIVERY_LIMIT -
        subtotal,
      0
    );

  const totalMrp = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.mrp ||
            item.price ||
            0
        ) *
          Number(item.qty || 1),
      0
    );
  }, [cart]);

  const productSavings =
    Math.max(
      totalMrp - subtotal,
      0
    );

  const deliverySavings =
    freeDeliveryUnlocked
      ? DELIVERY_CHARGE
      : 0;

  const totalSavings =
    productSavings +
    deliverySavings;

  const amountInWords =
    numberToWords(total);

  const upiUrl =
    `upi://pay?pa=ramakant.rao-1@okicici&pn=Fresh2Cook&am=${total}&cu=INR`;

  function getLocation() {
    if (!navigator.geolocation) {
      alert(
        "GPS not supported"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation(
          `${position.coords.latitude},${position.coords.longitude}`
        );
      },
      () => {
        alert(
          "Unable to fetch location"
        );
      }
    );
  }

  function saveSmallOrderRecord(
    createdOrderId: number
  ) {
    try {
      localStorage.setItem(
        "freshcut-payment-status",
        "Paid"
      );

      localStorage.setItem(
        "freshcut-order-id",
        String(createdOrderId)
      );

      localStorage.setItem(
        "freshcut-order-date",
        new Date().toISOString()
      );
    } catch (error) {
      console.error(
        "ORDER RECORD SAVE ERROR:",
        error
      );
    }
  }

  function openWhatsApp(
    otpValue?: string
  ) {
    const cleanedPhone =
      phone.replace(/\D/g, "");

    const whatsappNumber =
      cleanedPhone.length === 10
        ? `91${cleanedPhone}`
        : cleanedPhone;

    const productText =
      cart
        .map(
          (item) =>
            `${item.name} | ${item.pack || "-"} | Qty ${item.qty} | â‚¹${item.price}`
        )
        .join("\n");

    const message = `
Fresh2Cook - Order Confirmation

Dear ${customer},

Order ID: ${orderId || "-"}

Address:
${address}
${city} - ${pincode}

Mobile: ${phone}

Product Details:
${productText}

Subtotal: â‚¹${subtotal}
Handling: â‚¹${HANDLING_CHARGE}
Delivery: ${
      delivery === 0
        ? "FREE"
        : `â‚¹${delivery}`
    }

Product Saving: â‚¹${productSavings}
Delivery Saving: â‚¹${deliverySavings}
Total Saving: â‚¹${totalSavings}

Grand Total: â‚¹${total}

Delivery OTP: ${
      otpValue ||
      deliveryOtp ||
      "-"
    }

Status: PAID

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
    if (!customer.trim()) {
      alert(
        "Enter Customer Name"
      );
      return;
    }

    if (!phone.trim()) {
      alert(
        "Enter Mobile Number"
      );
      return;
    }

    if (!address.trim()) {
      alert(
        "Enter Delivery Address"
      );
      return;
    }

    if (cart.length === 0) {
      alert(
        "Your cart is empty."
      );
      return;
    }

    if (!transactionId.trim()) {
      alert(
        "Enter Transaction ID / UTR"
      );
      return;
    }

    try {
      setProcessing(true);

      const response =
        await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customer,
              phone,
              address,
              amount: total,
              items: cart.map(
                (item) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  qty: item.qty,
                  pack: item.pack,
                  mrp: item.mrp,
                })
              ),
              transactionId,
              paymentStatus:
                "Paid",
              city,
              pincode,
              gpsLocation,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to create order"
        );
      }

      const createdOrderId =
        Number(
          data?.order?.id || 0
        );

      const otp =
        String(
          data?.deliveryOtp ||
            data?.order?.deliveryOtp ||
            ""
        );

      if (createdOrderId > 0) {
        setOrderId(
          createdOrderId
        );

        saveSmallOrderRecord(
          createdOrderId
        );
      }

      if (otp) {
        setDeliveryOtp(otp);
      }

      setPaymentSuccess(true);

      localStorage.removeItem(
        "freshcut-cart"
      );

      setTimeout(() => {
        openWhatsApp(otp);
      }, 800);
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Order Failed"
      );
    } finally {
      setProcessing(false);
    }
  }

  if (paymentSuccess) {
    return (
      <>
        <style jsx global>{`
  @media print {
    @page {
      size: A5 portrait;
      margin: 2.5mm;
    }

    html,
    body {
      width: 148mm !important;
      min-height: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    header,
    .print-hide-global,
    .print-hide,
    button {
      display: none !important;
    }

    #invoice {
      width: 194mm !important;
      max-width: none !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 3mm !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      overflow: visible !important;
      background: #ffffff !important;
      font-size: 8px !important;
      line-height: 1.08 !important;
      zoom: 0.72 !important;
    }

    #invoice h2 {
      font-size: 11px !important;
      line-height: 1.05 !important;
    }

    #invoice h3 {
      font-size: 8px !important;
      line-height: 1.05 !important;
    }

    #invoice p,
    #invoice span,
    #invoice div {
      line-height: 1.08 !important;
    }

    #invoice > div.bg-green-700 {
      padding: 3mm !important;
    }

    #invoice > div.p-5,
    #invoice > div.p-6,
    #invoice > div[class*="p-5"],
    #invoice > div[class*="p-6"] {
      padding: 3mm !important;
    }

    #invoice table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 5.8px !important;
      line-height: 0.98 !important;
      margin-top: 1.5mm !important;
    }

    #invoice th,
    #invoice td {
      padding: 1px 1.2px !important;
      height: auto !important;
      line-height: 0.98 !important;
      white-space: nowrap !important;
    }

    #invoice th {
      font-size: 5.6px !important;
      font-weight: 700 !important;
    }

    #invoice td {
      font-size: 5.8px !important;
    }

    #invoice img {
      max-height: 26px !important;
    }

    #invoice img.absolute {
      width: 180px !important;
      opacity: 0.03 !important;
      bottom: 4px !important;
      right: 4px !important;
    }

    #invoice .border-b {
      padding-bottom: 2mm !important;
    }

    #invoice .grid {
      gap: 2mm !important;
    }

    #invoice .overflow-x-auto {
      overflow: visible !important;
    }

    #invoice .space-y-2 > * + * {
      margin-top: 1mm !important;
    }

    #invoice .space-y-3 > * + * {
      margin-top: 1mm !important;
    }

    #invoice .mt-4 {
      margin-top: 1.5mm !important;
    }

    #invoice .mt-5 {
      margin-top: 2mm !important;
    }

    #invoice .pt-4 {
      padding-top: 1.5mm !important;
    }

    #invoice .pt-2 {
      padding-top: 1mm !important;
    }

    #invoice .mb-4 {
      margin-bottom: 1mm !important;
    }

    #invoice .rounded-xl {
      border-radius: 3px !important;
    }

    #invoice .text-lg {
      font-size: 10px !important;
    }

    #invoice .text-xl {
      font-size: 11px !important;
    }

    #invoice .text-2xl {
      font-size: 13px !important;
    }

    #invoice .h-16 {
      height: 38px !important;
    }

    #invoice .h-20 {
      height: 42px !important;
    }

    #invoice .w-full.h-\\[150px\\] {
      height: 58px !important;
    }

    #invoice * {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    #invoice tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`}</style>

        <div className="min-h-screen bg-slate-100 p-4 md:p-6">
          <div
            id="invoice"
            className="relative bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden"
          >

            <img
              src="/Grocery Bag(1).png"
              alt="Fresh2Cook"
              className="absolute bottom-8 right-4 w-[420px] opacity-[0.04] pointer-events-none"
            />

            <div className="bg-green-700 text-white p-3 md:p-4">
              <div className="flex items-center justify-between gap-4">

                <img
                  src="/fresh2cook-logo.png"
                  alt="Fresh2Cook"
                  className="h-12 md:h-14 w-auto"
                />

                <div className="text-right">
                  <h2 className="text-xl md:text-2xl font-extrabold">
                    TAX INVOICE
                  </h2>

                  <p className="text-xs mt-1">
                    Invoice No:{" "}
                    INV-
                    {orderId || "----"}
                  </p>

                  <p className="text-sm">
                    {new Date().toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                </div>

              </div>
            </div>

            <div className="p-3 md:p-4">

              <div className="grid md:grid-cols-2 gap-3 border-b pb-2">

                <div>
                  <h3 className="font-bold text-sm mb-1">
                    Customer Details
                  </h3>

                  <p>
                    <strong>
                      Name:
                    </strong>{" "}
                    {customer}
                  </p>

                  <p>
                    <strong>
                      Mobile:
                    </strong>{" "}
                    {phone}
                  </p>

                  <p>
                    <strong>
                      Address:
                    </strong>{" "}
                    {address}
                  </p>

                  <p>
                    <strong>
                      City:
                    </strong>{" "}
                    {city || "-"}
                    {pincode
                      ? ` - ${pincode}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    care@fresh2cook.in
                  </p>

                  <p>
                    <strong>
                      Customer Care:
                    </strong>{" "}
                    9811001901
                  </p>

                  <p>
                    <strong>
                      Payment:
                    </strong>{" "}
                    PAID
                  </p>

                  {gpsLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      GPS:{" "}
                      {gpsLocation}
                    </p>
                  )}
                </div>

              </div>

              <div className="mt-1 pt-1 border-t text-xs">
                <span className="text-gray-600">
                  Delivery OTP:
                </span>{" "}
                <span className="font-extrabold text-red-600">
                  {deliveryOtp ||
                    "-"}
                </span>

                <span className="text-gray-500 ml-2">
                  (Give this OTP to delivery rider)
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">

                <h2 className="text-sm font-extrabold">
                  Order Summary
                </h2>

                {!freeDeliveryUnlocked ? (
                  <div className="text-[10px] font-extrabold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg">
                    Add â‚¹
                    {
                      amountForFreeDelivery
                    }{" "}
                    More For FREE Delivery
                  </div>
                ) : (
                  <div className="text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                    Ã°Å¸Å½â€° FREE Delivery Unlocked
                  </div>
                )}

              </div>

              <div className="overflow-x-auto mt-2">

                <table className="w-full border text-xs">

                  <thead>
                    <tr className="bg-green-700 text-white">
                      <th className="border p-1 text-left">
                        Product
                      </th>

                      <th className="border p-1">
                        Weight / Pack
                      </th>

                      <th className="border p-1">
                        Qty
                      </th>

                      <th className="border p-1">
                        MRP
                      </th>

                      <th className="border p-1">
                        Our Price
                      </th>

                      <th className="border p-1">
                        Saving
                      </th>

                      <th className="border p-1">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {cart.map(
                      (item) => {
                        const itemMrp =
                          Number(
                            item.mrp ||
                              item.price ||
                              0
                          );

                        const itemSaving =
                          Math.max(
                            itemMrp -
                              Number(
                                item.price
                              ),
                            0
                          ) *
                          Number(
                            item.qty || 1
                          );

                        return (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td className="border p-1 font-semibold">
                              {item.name}
                            </td>

                            <td className="border p-1 text-center">
                              {item.pack ||
                                "-"}
                            </td>

                            <td className="border p-1 text-center">
                              {
                                item.qty
                              }
                            </td>

                            <td className="border p-1 text-center">
                              â‚¹
                              {itemMrp}
                            </td>

                            <td className="border p-1 text-center font-semibold text-green-700">
                              â‚¹
                              {
                                item.price
                              }
                            </td>

                            <td className="border p-1 text-center font-extrabold text-red-600">
                              â‚¹
                              {
                                itemSaving
                              }
                            </td>

                            <td className="border p-1 text-center font-bold">
                              â‚¹
                              {Number(
                                item.price
                              ) *
                                Number(
                                  item.qty
                                )}
                            </td>
                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

              </div>

              <div className="grid grid-cols-[90px_1fr] gap-2 mt-2 items-stretch">

                <div className="border rounded-xl flex flex-col items-center justify-center p-1 overflow-hidden bg-white">

                  <img
                    src="/social-icons.png.png"
                    alt="Refer & Earn"
                    className="w-full h-[300px] object-contain"
                  />

                  <p className="text-[8px] text-center font-bold text-green-700 mt-0.5">
                    Refer & Earn â‚¹20
                  </p>

                </div>

                <div className="space-y-1 text-xs">

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total MRP
                    </span>

                    <span className="font-semibold">
                      â‚¹{totalMrp}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total Our Price
                    </span>

                    <span className="font-semibold">
                      â‚¹{subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-red-600 font-bold">
                    <span>
                      Product Saving
                    </span>

                    <span>
                      â‚¹
                      {
                        productSavings
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Handling Charges
                    </span>

                    <span className="font-semibold">
                      â‚¹
                      {
                        HANDLING_CHARGE
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Delivery Charges
                    </span>

                    <span className="font-semibold">
                      {delivery === 0
                        ? "FREE"
                        : `â‚¹${delivery}`}
                    </span>
                  </div>

                  {deliverySavings >
                    0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>
                        FREE Delivery Saving
                      </span>

                      <span>
                        â‚¹
                        {
                          deliverySavings
                        }
                      </span>
                    </div>
                  )}

                  

                  <div className="border-t pt-2">

                    <p className="text-xs text-gray-500">
                      Amount in Words
                    </p>

                    <p className="font-semibold text-gray-800">
                      {
                        amountInWords
                      }
                    </p>

                  </div>

                  <div className="flex justify-between border-t pt-2 text-lg md:text-xl font-extrabold">

                    <span>
                      Grand Total
                    </span>

                    <span className="text-green-700">
                      â‚¹{total}
                    </span>

                  </div>
                  <div className="mt-1 pt-1 border-t">

  <div className="flex justify-between items-center text-sm md:text-base font-bold text-red-600">
    <span>Your Saving in This Bill</span>
    <span>â‚¹{totalSavings}</span>
  </div>

  <div className="flex justify-between items-center text-xs md:text-sm font-semibold text-gray-700 mt-1">
    <span>Transaction ID / UTR</span>
    <span className="text-gray-800 text-right">
      {transactionId || "-"}
    </span>
  </div>

</div>

              <div className="mt-2 border-t pt-2 text-center text-xs">

                <p className="font-semibold">
                  Thank you for choosing Fresh2Cook
                </p>

                <p>
                  Fresh Ã¢â‚¬Â¢ Hygienic Ã¢â‚¬Â¢ Ready To Cook
                </p>

                <p>
                  care@fresh2cook.in
                </p>

                <p>
                  Customer Care: 9811001901
                </p>

              </div>

              <div className="mt-2 flex gap-2 print-hide">

                <button
                  onClick={() =>
                    window.print()
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                >
                  Print / Download Invoice
                </button>

                <button
                  onClick={() =>
                    openWhatsApp()
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                >
                  WhatsApp
                </button>

              </div>

            </div>
          </div>
        </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] p-4 md:p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">
          Checkout & Payment
        </h1>

        <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6">

          <div className="border rounded-2xl p-5 mb-6">

            <div className="flex items-center justify-between gap-3">

              <h2 className="text-sm font-extrabold">
                Order Summary
              </h2>

              {!freeDeliveryUnlocked ? (
                <div className="text-sm font-extrabold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg text-right">
                  Add â‚¹
                  {
                    amountForFreeDelivery
                  }{" "}
                  More For FREE Delivery
                </div>
              ) : (
                <div className="text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                  Ã°Å¸Å½â€° FREE Delivery Unlocked
                </div>
              )}

            </div>

            <div className="mt-5 space-y-3">

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Total Items
                </span>

                <span className="font-semibold">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  â‚¹{subtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Handling
                </span>

                <span className="font-semibold">
                  â‚¹
                  {
                    HANDLING_CHARGE
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery
                </span>

                <span className="font-semibold">
                  {delivery === 0
                    ? "FREE"
                    : `â‚¹${delivery}`}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">

                <span className="font-extrabold text-lg">
                  Amount Payable
                </span>

                <span className="text-2xl font-extrabold text-green-700">
                  â‚¹{total}
                </span>

              </div>

            </div>

          </div>

          <div className="border rounded-2xl p-6 mb-6">

            <h2 className="text-2xl font-bold text-center">
              Scan QR & Pay
            </h2>

            <div className="flex justify-center mt-6">
              <QRCode
                value={upiUrl}
                size={260}
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mt-5 text-center">

              <div className="text-sm text-gray-500">
                UPI ID
              </div>

              <div className="font-bold text-xl text-green-700">
                ramakant.rao-1@okicici
              </div>

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
                setCustomer(
                  e.target.value
                )
              }
              placeholder="Customer Name"
              className="w-full border p-4 rounded-xl"
            />

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Mobile Number"
              className="w-full border p-4 rounded-xl"
            />

            <textarea
              rows={3}
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="Delivery Address"
              className="w-full border p-4 rounded-xl"
            />

            <div className="grid md:grid-cols-2 gap-4">

              <input
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                placeholder="City"
                className="w-full border p-4 rounded-xl"
              />

              <input
                value={pincode}
                onChange={(e) =>
                  setPincode(
                    e.target.value
                  )
                }
                placeholder="Pincode"
                className="w-full border p-4 rounded-xl"
              />

            </div>

            <div className="flex gap-3">

              <input
                value={gpsLocation}
                readOnly
                placeholder="GPS Location"
                className="flex-1 border p-4 rounded-xl"
              />

              <button
                type="button"
                onClick={
                  getLocation
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-bold"
              >
                GPS
              </button>

            </div>

            <input
              value={transactionId}
              onChange={(e) =>
                setTransactionId(
                  e.target.value
                )
              }
              placeholder="Transaction ID / UTR"
              className="w-full border p-4 rounded-xl"
            />

            <button
              onClick={
                completePayment
              }
              disabled={
                processing
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-xl"
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


