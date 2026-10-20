import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms & Conditions | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="Rules for using the Fresh2Cook website and app."
      current="/terms-conditions"
      sections={(s) => [
      { heading: "Orders and prices", body: ["All prices are in INR and include taxes. Stock and prices may change without notice; the price shown when you place the order applies."] },
      { heading: "Delivery", body: [`We deliver only to serviceable pincodes. Delivery is free on orders of ₹${s.freeDeliveryTarget}+; below that a ₹${s.deliveryCharge} charge applies. Share the delivery OTP only when you receive your order.`] },
      { heading: "Account", body: ["You are responsible for keeping your account and password safe. Accounts may be suspended in case of misuse."] },
      { heading: "Wallet and rewards", body: [`Wallet credit is valid for ${s.walletExpiryDays} days, cannot be exchanged for cash, and rewards earned through misuse may be reversed.`] },
      { heading: "Limitation of liability", body: ["Fresh2Cook's liability is limited to the value of the order the complaint is about."] },
      { heading: "Governing law", body: ["These terms are governed by the laws of India; disputes fall under the jurisdiction of the courts of New Delhi."] },
    ]}
    />
  );
}
