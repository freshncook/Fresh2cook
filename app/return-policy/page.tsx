import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Refund & Return Policy | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      intro="Fresh produce is perishable, so returns and refunds follow the rules below."
      current="/return-policy"
      sections={(s) => [
      { heading: "When you get a refund", body: [["The item was damaged, spoiled or expired", "You received a wrong item or a short quantity", "The order was not delivered but the payment went through"]] },
      { heading: "How to request one", body: ["Within 24 hours of delivery, send us your order number and a photo of the item on WhatsApp or email. Our team will check and reply."] },
      { heading: "Refund method and timing", body: ["Approved refunds go back to your original payment method (UPI/bank) within 5–7 working days, or instantly to your Fresh2Cook wallet if you prefer."] },
      { heading: "Cancellation", body: ["Orders cancelled before packing get a full refund. Orders cannot be cancelled once they are packed or dispatched."] },
      { heading: "Not covered", body: [["Natural differences in the size, shape or colour of vegetables and fruits", "Complaints made more than 24 hours after delivery", "Orders not delivered because of a wrong address or the customer being unavailable"]] },
    ]}
    />
  );
}
