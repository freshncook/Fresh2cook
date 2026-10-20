import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQs | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="FAQs"
      intro="Common questions about ordering, delivery, payment and refunds at Fresh2Cook."
      current="/faqs"
      sections={(s) => [
      { heading: "How quickly do you deliver?", body: ["We deliver on the same day once your order is confirmed. As soon as a rider is assigned, you can follow the live status on My Account or the Track Order page."] },
      { heading: "What is the delivery charge?", body: [`Delivery is FREE on orders of ₹${s.freeDeliveryTarget} or more. Below that, a delivery charge of ₹${s.deliveryCharge}${s.handlingCharge ? ` and a handling charge of ₹${s.handlingCharge}` : ""} applies.`] },
      { heading: "Do you deliver in my area?", body: ["Enter your pincode on the home page and tap 'Check'. If your area is not covered yet, send us a message on WhatsApp."] },
      { heading: "What is the delivery OTP?", body: ["Every order has a 4-digit OTP. It appears on My Account / Track Order once the order is 'On the way'. Share it with the rider only after you have received your order, so the order reaches only you."] },
      { heading: "How do I pay?", body: ["Pay by UPI and enter the Transaction ID / UTR at checkout. Your order is processed once the payment is confirmed."] },
      { heading: "How does Refer & Earn work?", body: [`Your code is in My Account > Refer & Earn. When a friend signs up with your code they get ₹${s.referralWelcome} in their wallet, and you get ₹${s.referralReward} when their first order is delivered.`] },
      { heading: "Can I cancel or get a refund?", body: ["You can cancel an order before it is packed. For damaged or wrong items, WhatsApp us a photo within 24 hours of delivery. Full details are in the Refund Policy."] },
    ]}
    />
  );
}
